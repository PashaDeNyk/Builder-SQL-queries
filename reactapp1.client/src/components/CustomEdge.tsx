import { JoinType } from "../types";

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: { type: JoinType };
}) => {
  const edgePath = `M ${sourceX} ${sourceY} Q ${
    (sourceX + targetX) / 2
  } ${sourceY} ${targetX} ${targetY}`;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke="#60a5fa"
        strokeWidth={2}
      />
      <foreignObject
        width="100"
        height="40"
        x={(sourceX + targetX) / 2 - 50}
        y={sourceY - 20}
      >
        <div className="flex items-center justify-center h-full">
          <span className="bg-gray-800 px-2 py-1 rounded border border-blue-400 text-blue-400 text-sm shadow-sm">
            {data?.type || "JOIN"}
          </span>
        </div>
      </foreignObject>
    </>
  );
};
