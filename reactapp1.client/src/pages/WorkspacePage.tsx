import { useState, useCallback, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { ApiJoinRequest, ApiSelectionRequest, CalculatedField, Condition, Join, JoinType, Table } from "../types";
import { TableNode } from "../components/nodes/TableNode";
import Sidebar from "../components/panels/Sidebar";
import { WorkspaceDropArea } from "../components/WorkspaceDropArea";
import CalculatedFieldEditor from "../components/panels/CalculatedFieldEditor";
import { CustomEdge } from "../components/CustomEdge";
import JoinTypeModal from "../components/JoinTypeModal";
import { useQueryClient } from "@tanstack/react-query";
import { loadTablesFromDB } from "../api/db";
import api from "../api/client";
import QueryConfigurator from "../components/panels/QueryConfigurator";

const Workspace = () => {
    const queryClient = useQueryClient();
    const [lastQueryResult, setLastQueryResult] = useState<Record<string, unknown>[]>([]);
    const [cachedQueries, setCachedQueries] = useState<{ [key: string]: Record<string, unknown>[] }>({});
    const [availableTables, setAvailableTables] = useState<Table[]>([]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [joins, setJoins] = useState<Join[]>([]);
    const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([]);
    const [whereConditions, setWhereConditions] = useState<Condition[]>([]);
    const [generatedQuery, setGeneratedQuery] = useState("");
    const [queryResult, setQueryResult] = useState<Record<string, unknown>[]>([]);
    const [joinTypeModal, setJoinTypeModal] = useState<{ visible: boolean; connection: Connection | null }>({ visible: false, connection: null });
    const [loading, setLoading] = useState(true);
    const [groupByFields, setGroupByFields] = useState<string[]>([]);
    const [havingConditions, setHavingConditions] = useState<Condition[]>([]);
    const [resultColumns, setResultColumns] = useState<string[]>([]);
    const [orderByFields, setOrderByFields] = useState<{ column: string; direction: 'ASC' | 'DESC' }[]>([]);

    const [savedTables, setSavedTables] = useState<any>(null); // Добавили состояние для сохранения таблиц


    const queryTables = queryClient.getQueryData<Table[]>(["userTables"]);

    useEffect(() => {
        const loadTables = async () => {
            const tables = await loadTablesFromDB();
            
            console.log(tables, queryTables);

            setSavedTables(tables.tables);
            setAvailableTables(tables.tables || queryTables || []);

            setLoading(false);
        };
        loadTables();
    }, []);

    const handleDropItem = useCallback((tables: Table[], offset: { x: number; y: number } | null) => {
        if (!offset) return;
        const hasExistingTables = nodes.length > 0;
        const request: ApiSelectionRequest = {
            isSingleSelect: !hasExistingTables && tables.length === 1,
            isBulkSelect: hasExistingTables || tables.length > 1,
            tables: [...nodes.map(n => n.data.name), ...tables.map(t => t.name)]
        };
        const newNodes = tables.map((t, index) => ({
            id: t.name,
            position: { x: offset.x - 300 + index * 50, y: offset.y - 100 + index * 50 },
            data: t,
            type: "tableNode" as const,
        }));
        setNodes(nds => [...nds, ...newNodes]);
    }, [setNodes, nodes]);

    const deleteTables = (ids: string[]) => {
        setNodes((nodes) => nodes.filter((n: any) => !ids.includes(n.id)));
        setJoins((joins) => joins.filter((join) => !ids.includes(join.leftTable) && !ids.includes(join.rightTable)));
        setEdges((edges) => edges.filter((edge: any) => !ids.some((id) => edge.source.includes(id) || edge.target.includes(id))));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete") {
                const selectedNodes = nodes.filter((n: any) => n.selected);
                if (selectedNodes.length > 0) {
                    deleteTables(selectedNodes.map((n: any) => n.id));
                }
            }
        };
        const handleDeleteEvent = (e: CustomEvent) => {
            deleteTables([e.detail.id]);
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("deleteTable", handleDeleteEvent as EventListener);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("deleteTable", handleDeleteEvent as EventListener);
        };
    }, [nodes]);

    const onConnect = useCallback((connection: Connection) => {
        setJoinTypeModal({ visible: true, connection });
    }, []);

    const confirmJoinType = useCallback(async (type: JoinType) => {
        const conn = joinTypeModal.connection;
        if (!conn?.source || !conn?.target) return;

        const [sourceTable, sourceColumn] = conn.source.split("|");
        const [targetTable, targetColumn] = conn.target.split("|");

        try {
            setJoins(prev => [...prev, {
                leftTable: sourceTable,
                leftColumn: sourceColumn,
                rightTable: targetTable,
                rightColumn: targetColumn,
                type: type.toUpperCase(), // Сохраняем тип в верхнем регистре
            }]);

            setEdges(eds => addEdge({
                ...conn,
                data: { type },
                type: "custom",
            }, eds));
        } catch (error) {
            alert('Ошибка при создании соединения');
        } finally {
            setJoinTypeModal({ visible: false, connection: null });
        }
    }, [joinTypeModal.connection, setEdges, setJoins]);

    const readOneTable = async (table: string) => {
        try {
            const payload = { query: `select * from ${table};` };
            const res = await api.post('/database/read-table', payload);

            if (typeof res.data === 'string') {
                try {
                    let fixedJson = res.data.replace(/\\"/g, '"');
                    fixedJson = fixedJson.replace(/,\s*}/g, '}');
                    fixedJson = fixedJson.replace(/,\s*]/g, ']');
                    fixedJson = fixedJson.replace(/,(\s*})/g, '$1');

                    if (!fixedJson.startsWith('{')) {
                        fixedJson = `{${fixedJson}}`;
                    }

                    const result = JSON.parse(fixedJson);

                    if (result.tables && result.tables.length > 0) {
                        const tableData = result.tables[0];
                        const columns = tableData.columns.map((col: any) => col.name);
                        const data = tableData.data.map((item: any) => {
                            const flatItem: Record<string, any> = {};
                            Object.entries(item).forEach(([key, value]) => {
                                flatItem[key] = value;
                            });
                            return flatItem;
                        });

                        setLastQueryResult(data);
                        setResultColumns(columns); // Устанавливаем колонки
                    }
                } catch (parseError) {
                    console.error("JSON parse error:", parseError);
                }
            }
        } catch (error) {
            console.error("API error:", error);
        }
    };

    const throwQuery = async (tables: string[], fields: any[]) => {
        try {
            // Основная таблица - всегда первая в массиве
            const mainTable = tables[0];

            // Подготовка JOIN структуры
            let joinPayload = { Item1: null, Item2: null, Item3: null, Item4: null };

            if (joins.length > 0) {
                // Берем первый JOIN (можно расширить для множественных JOIN)
                const firstJoin = joins[0];

                joinPayload = {
                    Item1: firstJoin!.type!.toUpperCase(), // Тип JOIN в верхнем регистре
                    Item2: firstJoin.rightTable,        // Таблица для JOIN
                    Item3: firstJoin.leftColumn,        // Столбец из основной таблицы
                    Item4: firstJoin.rightColumn        // Столбец из присоединяемой таблицы
                };

                // Для CROSS JOIN не указываем столбцы
                if (firstJoin.type.toUpperCase() === 'CROSS') {
                    joinPayload.Item3 = null;
                    joinPayload.Item4 = null;
                }
            } else if (tables.length > 1) {
                // Если нет JOIN, но несколько таблиц - это CROSS JOIN
                joinPayload = {
                    Item1: 'CROSS',
                    Item2: tables[1], // Вторая таблица
                    Item3: null,      // Для CROSS JOIN столбцы не указываются
                    Item4: null
                };
            }

            // Подготовка WHERE условий
            const whereConditionsPayload = whereConditions.length > 0 ? {
                Item1: whereConditions[0].column,
                Item2: whereConditions[0].operator,
                Item3: whereConditions[0].value
            } : { Item1: null, Item2: null, Item3: null };

            // Подготовка GROUP BY
            const groupByPayload = groupByFields.length > 0 ? groupByFields : null;

            // Подготовка HAVING условий
            const havingConditionsPayload = havingConditions.length > 0 ? {
                Item1: havingConditions[0].column,
                Item2: havingConditions[0].operator,
                Item3: havingConditions[0].value
            } : { Item1: null, Item2: null, Item3: null };

            // Подготовка ORDER BY
            const orderByPayload = orderByFields.length > 0 ? {
                Item1: orderByFields[0].column,
                Item2: orderByFields[0].direction,
                Item3: null
            } : { Item1: null, Item2: null, Item3: null };

            const payload = {
                query: {
                    Name: mainTable, // Только одна таблица
                    Select: fields.join(', '),
                    Join: joinPayload,
                    Where: whereConditionsPayload,
                    OrderBy: orderByPayload,
                    Having: havingConditionsPayload,
                    GroupBy: groupByPayload
                }
            };

            const res = await api.post('/create-query', payload);
            if (!res) throw res;

            // Обработка ответа
            if (typeof res.data === 'string') {
                try {
                    let fixedJson = res.data.replace(/\\"/g, '"');
                    fixedJson = fixedJson.replace(/,\s*}/g, '}');
                    fixedJson = fixedJson.replace(/,\s*]/g, ']');
                    fixedJson = fixedJson.replace(/,(\s*})/g, '$1');

                    if (!fixedJson.startsWith('{')) {
                        fixedJson = `{${fixedJson}}`;
                    }

                    const result = JSON.parse(fixedJson);

                    if (result.tables && result.tables.length > 0) {
                        const tableData = result.tables[0];
                        const columns = tableData.columns.map((col: any) => col.name);
                        const data = tableData.data.map((item: any) => {
                            const flatItem: Record<string, any> = {};
                            Object.entries(item).forEach(([key, value]) => {
                                flatItem[key] = value;
                            });
                            return flatItem;
                        });

                        setLastQueryResult(data);
                        setResultColumns(columns);
                    }
                } catch (parseError) {
                    console.error("JSON parse error:", parseError);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const generateQuery = async () => {
        
        if (nodes.length === 0) {
            setGeneratedQuery("-- Add tables to workspace --");
            return "";
        }

        const tables = nodes.map((n: any) => n.data.name);
        const fields = [
            ...nodes.flatMap((n: any) => n.data.columns.map((c: any) => `${n.data.name}.${c.name}`)),
            ...calculatedFields.map((f) => `${f.expression} AS ${f.alias}`),
        ];

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.map((c) => `${c.column} ${c.operator} ${c.value}`).join(" AND ")}`
            : "";

        const groupByClause = groupByFields.length > 0
            ? `GROUP BY ${groupByFields.join(", ")}`
            : "";
        console.log(havingConditions);
        const havingClause = havingConditions.length > 0
            ? `HAVING ${havingConditions.map((c) => `${c.column} ${c.operator} ${c.value}`).join(" AND ")}`
            : "";

        const orderByClause = orderByFields.length > 0
            ? `ORDER BY ${orderByFields.map((o) => `${o.column} ${o.direction}`).join(", ")}`
            : "";

        let query = "";

        if (joins.length === 0 && tables.length > 1) {
            const fromClause = tables.reduce((acc, table, index) => index === 0 ? table : `${acc} CROSS JOIN ${table}`, "");
            query = `SELECT ${fields.join(", ")} FROM ${fromClause} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause}`;
        } else if (joins.length > 0) {
            let fromClause = joins[0].leftTable;
            const usedTables = new Set<string>([joins[0].leftTable]);
            for (const join of joins) {
                if (!usedTables.has(join.rightTable)) {
                    fromClause += ` ${join.type} JOIN ${join.rightTable} ON ${join.leftTable}.${join.leftColumn} = ${join.rightTable}.${join.rightColumn}`;
                    usedTables.add(join.rightTable);
                }
            }
            for (const table of tables) {
                if (!usedTables.has(table)) {
                    fromClause += ` CROSS JOIN ${table}`;
                }
            }
            query = `SELECT ${fields.join(", ")} FROM ${fromClause} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause}`;
        } else {
            query = `SELECT ${fields.join(", ")} FROM ${tables[0]} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause}`;
        }

        if (tables.length === 1 && whereConditions.length === 0 && groupByFields.length === 0 && havingConditions.length === 0 && orderByFields.length === 0) {
            await readOneTable(tables[0]);
        } else {
            await throwQuery(tables, fields);
        }

        setGeneratedQuery(query.trim().replace(/\s+/g, " "));
        return query;
    };

    const handleAddGroupBy = () => {
        setGroupByFields([...groupByFields, '']);
    };

    const handleAddHaving = () => {
        setHavingConditions([...havingConditions, { field: '', operator: '', value: '' }]);
    };

    const handleAddOrderBy = () => {
        setOrderByFields([...orderByFields, { field: '', order: 'ASC' }]);
    };

    const handleGroupByChange = (index, value) => {
        const updated = [...groupByFields];
        updated[index] = value;
        setGroupByFields(updated);
    };

    const handleHavingChange = (index, key, value) => {
        const updated = [...havingConditions];
        updated[index][key] = value;
        setHavingConditions(updated);
    };

    const handleOrderByChange = (index, key, value) => {
        const updated = [...orderByFields];
        updated[index][key] = value;
        setOrderByFields(updated);
    };

    const handleRemoveGroupBy = (index) => {
        const updated = [...groupByFields];
        updated.splice(index, 1);
        setGroupByFields(updated);
    };

    const handleRemoveHaving = (index) => {
        const updated = [...havingConditions];
        updated.splice(index, 1);
        setHavingConditions(updated);
    };

    const handleRemoveOrderBy = (index) => {
        const updated = [...orderByFields];
        updated.splice(index, 1);
        setOrderByFields(updated);
    };
    const mockResult = [
        { "user_id": 6 },
        { "user_id": 7 },
        { "user_id": 8 },
        { "user_id": 9 }
    ];

    const availableFields = useMemo(() => {
        return nodes.flatMap((node) =>
            node.data.columns.map((col) => `${node.data.name}.${col.name}`)
        );
    }, [nodes]);
    const executeQuery = useCallback(() => {
        if (nodes.length === 0) return;

        let result: Record<string, unknown>[] = [];

        if (nodes.length === 1) {
            result = nodes[0].data.data || [];
        } else if (nodes.length > 1) {
            result = nodes[0].data.data.flatMap((leftRow: any) =>
                nodes[1].data.data.map((rightRow: any) => ({ ...leftRow, ...rightRow }))
            );
        }

        if (whereConditions.length > 0) {
            result = result.filter((row) =>
                whereConditions.every((cond) => {
                    const columnParts = cond.column.split(".");
                    const columnName = columnParts.length > 1 ? columnParts[1] : columnParts[0];
                    const value = row[columnName];
                    try {
                        return eval(`${value} ${cond.operator} ${cond.value}`);
                    } catch {
                        return false;
                    }
                })
            );
        }

        setLastQueryResult(result);
    }, [nodes, whereConditions]);

    const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
    const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
    const handleExecuteQuery = useCallback(async () => {
        console.log('im here');
        try {
            console.log('try');
            await generateQuery();
            executeQuery();
        } catch (error) {
            console.error("Error executing query:", error);
        }
    }, [generateQuery, executeQuery]);

    if (loading) return <div>Loading tables...</div>;

    return (
        <DndProvider backend={HTML5Backend}>
            <JoinTypeModal
                visible={joinTypeModal.visible}
                connection={joinTypeModal.connection}
                onConfirm={confirmJoinType}
                onCancel={() => setJoinTypeModal({ visible: false, connection: null })}
            />
            <div className="flex flex-col xl:flex-row h-scr bg-gray-900">
                <div className="w-full xl:w-64 bg-gray-800 border-r border-gray-700 z-10">
                    <Sidebar availableTables={availableTables} />
                </div>

                <WorkspaceDropArea onDropItem={handleDropItem} className="flex-1 relative">
                    <div className="absolute inset-0">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                        >
                            <Background color="#374151" gap={16} />
                            <Controls className="bg-gray-800 rounded border border-gray-700 [&>button]:bg-gray-700 [&>button]:text-gray-200" />
                        </ReactFlow>
                    </div>

                    <div className="absolute top-4 right-4 z-10 w-96 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-blue-400">Calculated Fields</h3>
                            <CalculatedFieldEditor
                                fields={calculatedFields}
                                onAdd={(field) => setCalculatedFields((prev) => [...prev, field])}
                                onRemove={(index) => setCalculatedFields((prev) => prev.filter((_, i) => i !== index))}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-blue-400">Query Controls</h3>
                            <button
                                onClick={handleExecuteQuery}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Execute Query
                            </button>
                        </div>
                        <div className="query-configurator">
                            <h2>GROUP BY</h2>
                            {groupByFields.map((field, index) => (
                                <div key={index} className="field-row">
                                    <select
                                        value={field}
                                        onChange={(e) => handleGroupByChange(index, e.target.value)}
                                    >
                                        <option value="">Choose field</option>
                                        {availableFields.map((availableField) => (
                                            <option key={availableField} value={availableField}>
                                                {availableField}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleRemoveGroupBy(index)}>delete</button>
                                </div>
                            ))}
                            <button onClick={handleAddGroupBy}>add GROUP BY</button>

                            <h2>HAVING</h2>
                            {havingConditions.map((condition, index) => (
                                <div key={index} className="field-row">
                                    <select
                                        value={condition.field}
                                        onChange={(e) => handleHavingChange(index, 'field', e.target.value)}
                                    >
                                        <option value="">Choose field</option>
                                        {availableFields.map((availableField) => (
                                            <option key={availableField} value={availableField}>
                                                {availableField}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={condition.operator}
                                        onChange={(e) => handleHavingChange(index, 'operator', e.target.value)}
                                    >
                                        <option value="">Operator</option>
                                        <option value="=">=</option>
                                        <option value=">">{'>'}</option>
                                        <option value="<">{'<'}</option>
                                        <option value=">=">{'>='}</option>
                                        <option value="<=">{'<='}</option>
                                        <option value="<>">{'<>'}</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={condition.value}
                                        placeholder="Значение"
                                        onChange={(e) => handleHavingChange(index, 'value', e.target.value)}
                                    />
                                    <button onClick={() => handleRemoveHaving(index)}>delete</button>
                                </div>
                            ))}
                            <button onClick={handleAddHaving}>add HAVING</button>

                            <h2>ORDER BY</h2>
                            {orderByFields.map((order, index) => (
                                <div key={index} className="field-row">
                                    <select
                                        value={order.field}
                                        onChange={(e) => handleOrderByChange(index, 'field', e.target.value)}
                                    >
                                        <option value="">Choose field</option>
                                        {availableFields.map((availableField) => (
                                            <option key={availableField} value={availableField}>
                                                {availableField}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={order.order}
                                        onChange={(e) => handleOrderByChange(index, 'order', e.target.value)}
                                    >
                                        <option value="ASC">ASC</option>
                                        <option value="DESC">DESC</option>
                                    </select>
                                    <button onClick={() => handleRemoveOrderBy(index)}>Delete</button>
                                </div>
                            ))}
                            <button onClick={handleAddOrderBy}>add ORDER BY</button>
                        </div>
                    </div>
                </WorkspaceDropArea>
              

            </div>
            <div className="w-full w-f xl:w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4 z-10 xl:h-full xl:order-none order-last max-xl:h-96">
                <h3 className="text-lg font-bold mb-4 text-blue-400">Generated SQL</h3>
                <div className="font-mono text-sm bg-gray-900 p-2 rounded mb-4 text-gray-300">
                    {generatedQuery || "-- SQL query will be generated here --"}
                </div>
                <h3 className="text-lg font-bold mb-4 text-blue-400">Results</h3>
                <div className="p-4 w-full overflow-x-auto">
                    <h2 className="text-lg font-semibold mb-2 text-white">Результат запроса</h2>
                    {lastQueryResult.length > 0 ? (
                        <table className="min-w-full bg-gray-800 text-white border border-gray-700">
                            <thead>
                                <tr>
                                    {resultColumns.map((key) => (
                                        <th key={key} className="py-2 px-4 border-b border-gray-600 text-left">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lastQueryResult.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-700">
                                        {resultColumns.map((key, colIndex) => (
                                            <td key={colIndex} className="py-2 px-4 border-b border-gray-600">
                                                {row[key] !== null && row[key] !== undefined ? String(row[key]) : 'NULL'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-400">Нет данных для отображения</p>
                    )}
                </div>
            </div>
           
        </DndProvider>

    );
};

export default Workspace;