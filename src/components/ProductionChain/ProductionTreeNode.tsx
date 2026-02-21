import { Badge } from "flowbite-react";
import type { ProductionNode } from "../../types";

type ProductionTreeNodeProps = {
  node: ProductionNode;
  depth?: number;
};

const tierColors: Record<string, string> = {
  p1: "info",
  p2: "success",
  p3: "warning",
  p4: "failure",
};

export function ProductionTreeNode({
  node,
  depth = 0,
}: ProductionTreeNodeProps) {
  const color = tierColors[node.tier] ?? "gray";

  return (
    <div className={depth > 0 ? "ml-6 border-l border-gray-600 pl-4" : ""}>
      <div className="flex items-center gap-2 py-1">
        <Badge color={color} className="uppercase">
          {node.tier}
        </Badge>
        <span className="font-medium text-white">{node.name}</span>
        <span className="text-sm text-gray-400">×{node.quantity}</span>
      </div>
      {node.inputs.length > 0 && (
        <div className="mt-1">
          {node.inputs.map((input) => (
            <ProductionTreeNode
              key={input.typeId}
              node={input}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
