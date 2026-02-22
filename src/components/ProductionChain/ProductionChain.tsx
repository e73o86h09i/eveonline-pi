import type { FC } from 'react';
import { Alert, Card, Spinner, TabItem, Tabs, ToggleSwitch } from 'flowbite-react';
import type { CommoditySelection } from '../../types';
import { useMultiProductionChain } from '../../hooks';
import { useProductionTree } from './ProductionTreeContext';
import { ProductionTreeNode } from './ProductionTreeNode';
import { ProductionSummary } from './ProductionSummary';

type ProductionChainProps = {
  selections: CommoditySelection[];
};

const ProductionChain: FC<ProductionChainProps> = ({ selections }) => {
  const { trees, loading, errors } = useMultiProductionChain(selections);
  const { exactNumbers, setExactNumbers, activeTab, setActiveTab } = useProductionTree();

  const hasSelections = selections.some((sel) => sel.typeId !== null);

  if (!hasSelections) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <p className="text-gray-400">Select a commodity above to view its production chain.</p>
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

  if (errors.length > 0) {
    return (
      <Alert color="failure" className="mt-6">
        <span>Error loading production chain: {errors.join(', ')}</span>
      </Alert>
    );
  }

  if (trees.length === 0) {
    return null;
  }

  const allTrees = trees.map((resolved) => resolved.tree);

  return (
    <Card className="mt-6 border-gray-700 bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Production Chain</h2>
        <ToggleSwitch checked={exactNumbers} onChange={setExactNumbers} label="Exact numbers" sizing="sm" />
      </div>
      <Tabs variant="underline" onActiveTabChange={setActiveTab}>
        <TabItem active={activeTab === 0} title="Tree">
          {trees.map((resolved, idx) => (
            <div key={resolved.selectionId}>
              {idx > 0 && <hr className="my-4 border-gray-700" />}
              <ProductionTreeNode node={resolved.tree} path={`sel-${resolved.selectionId}:${resolved.tree.typeId}`} />
            </div>
          ))}
        </TabItem>
        <TabItem active={activeTab === 1} title="Summary">
          <ProductionSummary trees={allTrees} />
        </TabItem>
      </Tabs>
    </Card>
  );
};

export default ProductionChain;
