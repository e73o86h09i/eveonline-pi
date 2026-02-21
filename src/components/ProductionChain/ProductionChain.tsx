import { Alert, Card, Spinner } from "flowbite-react";
import { useProductionChain } from "../../hooks";
import { ProductionTreeNode } from "./ProductionTreeNode";

type ProductionChainProps = {
  typeId: number | null;
};

export function ProductionChain({ typeId }: ProductionChainProps) {
  const { tree, loading, error } = useProductionChain(typeId);

  if (typeId === null) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <p className="text-gray-400">
          Select a commodity above to view its production chain.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 text-gray-400">
          <Spinner size="md" />
          <span>Building production chain...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert color="failure" className="mt-6">
        <span>Error loading production chain: {error}</span>
      </Alert>
    );
  }

  if (!tree) return null;

  return (
    <Card className="mt-6 border-gray-700 bg-gray-800">
      <h2 className="mb-4 text-lg font-bold text-white">Production Chain</h2>
      <ProductionTreeNode node={tree} />
    </Card>
  );
}
