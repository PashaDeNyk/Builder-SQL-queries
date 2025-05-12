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
import { QueryClient } from "@tanstack/react-query";

const Workspace = () => {
    const [lastQueryResult, setLastQueryResult] = useState<Record<string, unknown>[]>([]);
    const [cachedQueries, setCachedQueries] = useState<{
        [key: string]: Record<string, unknown>[];
    }>({});
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>(
    []
  );
  const [whereConditions, setWhereConditions] = useState<Condition[]>([]);
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [queryResult, setQueryResult] = useState<Record<string, unknown>[]>([]);
  const [joinTypeModal, setJoinTypeModal] = useState<{
    visible: boolean;
    connection: Connection | null;
  }>({ visible: false, connection: null });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const queryClient = new QueryClient();
        setAvailableTables(queryClient.getQueryData(["userTables"]));
        setLoading(false);
    }, []);

    const handleDropItem = useCallback(
        (tables: Table[], offset: { x: number; y: number } | null) => {
            if (!offset) return;

            // Проверяем наличие существующих таблиц
            const hasExistingTables = nodes.length > 0;

            // Формируем запрос
            const request: ApiSelectionRequest = {
                isSingleSelect: !hasExistingTables && tables.length === 1,
                isBulkSelect: hasExistingTables || tables.length > 1,
                tables: [
                    ...nodes.map(n => n.data.name), // существующие таблицы
                    ...tables.map(t => t.name)      // новые таблицы
                ]
            };

            console.log('Selection request:', request);

            // Создаем узлы только для новых таблиц
            const newNodes = tables.map((t, index) => ({
                id: t.name,
                position: {
                    x: offset.x - 300 + index * 50,
                    y: offset.y - 100 + index * 50
                },
                data: t,
                type: "tableNode" as const,
            }));

            setNodes(nds => [...nds, ...newNodes]);
        },
        [setNodes, nodes]
    );

  const deleteTables = (ids: string[]) => {
    // Удаляем узлы
    setNodes((nodes) => nodes.filter((n: any) => !ids.includes(n.id)));

    // Удаляем join'ы, связанные с таблицами
    setJoins((joins) =>
      joins.filter(
        (join) =>
          !ids.includes(join.leftTable) && !ids.includes(join.rightTable)
      )
    );

    // Удаляем edge'ы
    setEdges((edges) =>
      edges.filter(
        (edge: any) =>
          !ids.some(
            (id) => edge.source.includes(id) || edge.target.includes(id)
          )
      )
    );
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
      window.removeEventListener(
        "deleteTable",
        handleDeleteEvent as EventListener
      );
    };
  }, [nodes]);

  const onConnect = useCallback((connection: Connection) => {
    setJoinTypeModal({ visible: true, connection });
  }, []);

    // Workspace.tsx
    const confirmJoinType = useCallback(async (type: JoinType) => {
        const conn = joinTypeModal.connection;
        if (!conn?.source || !conn?.target) return;

        const [sourceTable, sourceColumn] = conn.source.split("|");
        const [targetTable, targetColumn] = conn.target.split("|");

        // Отправка данных о джойне на сервер
        const joinRequest: ApiJoinRequest = {
            isJoin: true,
            joinType: type,
            tables: [sourceTable, targetTable]
        };

        try {
            // Здесь должен быть реальный API вызов
            console.log('Join request:', joinRequest);

            // Остальная логика обработки джойна
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
            console.error('Join error:', error);
            alert('Ошибка при создании соединения');
        } finally {
            setJoinTypeModal({ visible: false, connection: null });
        }
    }, [joinTypeModal.connection, setEdges, setJoins]);

    const generateQuery = () => {
        if (generatedQuery)
            return generatedQuery;
        else {
            if (nodes.length === 0) {
                setGeneratedQuery("-- Add tables to workspace --");
                return "";
            }

            const tables = nodes.map((n: any) => n.data.name);

            const fields = [
                ...nodes.flatMap((n: any) =>
                    n.data.columns.map((c: any) => `${n.data.name}.${c.name}`)
                ),
                ...calculatedFields.map((f) => `${f.expression} AS ${f.alias}`),
            ];

            const whereClause =
                whereConditions.length > 0
                    ? `WHERE ${whereConditions
                        .map((c) => `${c.column} ${c.operator} ${c.value}`)
                        .join(" AND ")}`
                    : "";

            if (joins.length === 0 && tables.length > 1) {
                const fromClause = tables.reduce((acc, table, index) => {
                    if (index === 0) return table;
                    return `${acc} CROSS JOIN ${table}`;
                }, "");

                const query = `SELECT ${fields.join(
                    ", "
                )} FROM ${fromClause} ${whereClause}`
                    .trim()
                    .replace(/\s+/g, " ");

                setGeneratedQuery(query);
                return query;
            }

            if (joins.length > 0) {
                let fromClause = "";
                const usedTables = new Set<string>();

                let rootTable = joins[0].leftTable;
                usedTables.add(rootTable);
                fromClause = rootTable;

                for (const join of joins) {
                    if (!usedTables.has(join.rightTable)) {
                        fromClause += ` ${join.type} JOIN ${join.rightTable} ON ${join.leftTable}.${join.leftColumn} = ${join.rightTable}.${join.rightColumn}`;
                        usedTables.add(join.rightTable);
                    }
                }

                for (const table of tables) {
                    if (!usedTables.has(table)) {
                        fromClause += ` CROSS JOIN ${table}`;
                        usedTables.add(table);
                    }
                }

                const query = `SELECT ${fields.join(
                    ", "
                )} FROM ${fromClause} ${whereClause}`
                    .trim()
                    .replace(/\s+/g, " ");

                setGeneratedQuery(query);
                return query;
            }

            const query = `SELECT ${fields.join(", ")} FROM ${tables[0]} ${whereClause}`
                .trim()
                .replace(/\s+/g, " ");

            setGeneratedQuery(query);
            return query;
        }
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
        nodes[1].data.data.map((rightRow: any) => ({
          ...leftRow,
          ...rightRow,
        }))
      );
    }

    result = result.filter((row) =>
      whereConditions.every((cond) => {
        const value = row[cond.column.split(".")[1]];
        // Будьте осторожны с eval – для продакшена стоит использовать безопасное решение
        return eval(`${value} ${cond.operator} ${cond.value}`);
      })
    );

    setQueryResult(result);
    };


  const nodeTypes = useMemo(() => {
    return {
      tableNode: TableNode,
    };
  }, []);

    if (loading) {
        return <div>Loading tables...</div>;
    }

  return (
    <DndProvider backend={HTML5Backend}>
      <JoinTypeModal
        visible={joinTypeModal.visible}
        connection={joinTypeModal.connection}
        onConfirm={confirmJoinType}
        onCancel={() => setJoinTypeModal({ visible: false, connection: null })}
      />
          <div className="flex h-screen bg-gray-900">
              <Sidebar availableTables={availableTables} />
        <WorkspaceDropArea onDropItem={handleDropItem}>
           <ReactFlow
            className="h-1/2 !important"
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
            <Controls className="bg-gray-800 rounded-lg border border-gray-700 [&>button]:bg-gray-700 [&>button]:hover:bg-gray-600 [&>button]:text-gray-200" />
          </ReactFlow>
          <div className="absolute top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg w-96 space-y-4 border border-gray-700">
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">
                Calculated Fields
              </h3>
              <CalculatedFieldEditor
                fields={calculatedFields}
                onAdd={(field) =>
                  setCalculatedFields((prev) => [...prev, field])
                }
                onRemove={(index) =>
                  setCalculatedFields((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-400">
                Query Controls
              </h3>
              <button
                onClick={() => {
                  generateQuery();
                  executeQuery();
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-600"
              >
                Execute Query
              </button>
            </div>
          </div>
        </WorkspaceDropArea>
        <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-blue-400">
            Generated SQL
          </h3>
          <div className="font-mono text-sm bg-gray-900 p-2 rounded mb-4 text-gray-300">
            {generatedQuery || "-- SQL query will be generated here --"}
          </div>
          <h3 className="text-lg font-bold mb-4 text-blue-400">Results</h3>
          <div className="bg-gray-900 p-2 rounded">
            {queryResult.slice(0, 10).map((row, i) => (
              <div key={i} className="mb-2 p-2 bg-gray-800 rounded shadow-sm">
                <pre className="text-gray-300 text-xs">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Workspace;
