import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Grid } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { TreeItem, TreeView } from "@mui/x-tree-view";

export const DefaultTree = [
  {
    $id: "_users_",
    name: "Users",
  },
  {
    $id: "_teams_",
    name: "Teams",
  },
];

export interface TreeNode {
  $id: string;
  name: string;
  children?: TreeNode[];
  checked: boolean;
}

interface TreeViewProps {
  data: TreeNode[];
  handleCheck: (node: string, checked: boolean) => void;
}

const TreeViewWithCheckbox = ({ data, handleCheck }: TreeViewProps) => {
  const renderTree = (nodes: TreeNode[]) =>
    nodes.map((node) => {
      return (
        <TreeItem
          key={node.$id}
          nodeId={node.$id}
          style={{ width: undefined }}
          ContentComponent={() => (
            <Grid container alignItems="center">
              <Checkbox
                color="primary"
                checked={node.checked}
                onChange={(e) => handleCheck(node.$id, e.target.checked)}
                indeterminate={
                  node.children &&
                  node.children.some((n) => n.checked) &&
                  !node.children.every((n) => n.checked)
                }
              />
              {node.name}
              {/* <Checkbox
                color="primary"
                checked={node.checked}
                onChange={(e) => handleCheck(node.$id, e.target.checked)}
                indeterminate={
                  node.children && node.children.some((n) => n.checked)
                }
              />
              {"Only schema"} */}
            </Grid>
          )}
        >
          {node.children ? renderTree(node.children) : null}
        </TreeItem>
      );
    });

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{
        height: 240,
        flexGrow: 1,
        width: "100%",
        overflowY: "scroll",
      }}
      expanded={data.map((i) => i.$id)}
    >
      {renderTree(data)}
    </TreeView>
  );
};

export default TreeViewWithCheckbox;
