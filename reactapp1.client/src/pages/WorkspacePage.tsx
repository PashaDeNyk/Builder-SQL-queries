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

        const joinRequest: ApiJoinRequest = {
            isJoin: true,
            joinType: type,
            tables: [sourceTable, targetTable]
        };

        try {
            setJoins(prev => [...prev, {
                leftTable: sourceTable,
                leftColumn: sourceColumn,
                rightTable: targetTable,
                rightColumn: targetColumn,
                type,
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

    const throwQuery = async (table: string, fields: any[]) => {
        try {
            const payload = { Name: table, Select: '*', Join: { Item1: null, Item2: null, Item3: null, Item4: null }, Where: { Item1: null, Item2: null, Item3: null }, OrderBy: { Item1: null, Item2: null, Item3: null }, Having: { Item1: null, Item2: null, Item3: null }, GroupBy: null };
            const res = await api.post('/create-query', payload);
            if (!res) throw res;
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    }

    const generateQuery = () => {
        if (generatedQuery) return generatedQuery;
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

        setGeneratedQuery(query.trim().replace(/\s+/g, " "));
        return query;
    };


    const executeQuery = () => {
        if (lastQueryResult) {
            setQueryResult(lastQueryResult);
            return;
        }

        let result: Record<string, unknown>[] = [];

        if (nodes.length === 1) {
            result = nodes[0].data.data;
        } else if (nodes.length > 1) {
            result = nodes[0].data.data.flatMap((leftRow: any) =>
                nodes[1].data.data.map((rightRow: any) => ({ ...leftRow, ...rightRow }))
            );
        }

        result = result.filter((row) =>
            whereConditions.every((cond) => {
                const value = row[cond.column.split(".")[1]];
                return eval(`${value} ${cond.operator} ${cond.value}`);
            })
        );

        setQueryResult(result);
    };

    const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

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
                            edgeTypes={{ custom: CustomEdge }}
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
                                onClick={() => {
                                    generateQuery();
                                    executeQuery();
                                }}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Execute Query
                            </button>
                        </div>
                    </div>
                </WorkspaceDropArea>
                <div className="w-full xl:w-96 bg-gray-800 border-l border-gray-700 p-4">
                    {/* 1) Configurator for GROUP BY / HAVING / ORDER BY */}
                    <QueryConfigurator
                        availableFields={
                            // flat list of all columns and calculated aliases
                            [
                                ...nodes.flatMap((n: any) => n.data.columns.map((c: any) => `${n.data.name}.${c.name}`)),
                                ...calculatedFields.map((f) => f.alias),
                            ]
                        }
                        groupByFields={groupByFields}
                        setGroupByFields={setGroupByFields}
                        havingConditions={havingConditions}
                        setHavingConditions={setHavingConditions}
                        orderByFields={orderByFields}
                        setOrderByFields={setOrderByFields}
                    />

                    {/* 2) Generated SQL */}
                    <h3 className="text-blue-400 font-bold mt-4">Generated SQL</h3>
                    <pre className="bg-gray-900 p-2 rounded mt-2 text-sm text-gray-300">
                        {generatedQuery || "-- SQL query will be generated here --"}
                    </pre>

                    {/* 3) Results preview (first 10 rows) */}
                    <h3 className="text-blue-400 font-bold mt-4">Results</h3>
                    <div className="space-y-2 mt-2 overflow-y-auto max-h-60">
                        {queryResult.slice(0, 10).map((row, i) => (
                            <div key={i} className="bg-gray-800 p-2 rounded">
                                <pre className="text-xs text-gray-300">{JSON.stringify(row, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                </div>
               
            </div>
           
        </DndProvider>

    );
};

export default Workspace;