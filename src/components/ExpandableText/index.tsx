import { Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import "./style.css";

const { Paragraph } = Typography;

interface ExpandableTextProps {
    text: string;
    onExpand: () => void;
}

const expandSymbol = (
    <span>
        expand <ArrowDownOutlined />
    </span>
);

const collapseSymbol = (
    <span>
        collapse <ArrowUpOutlined />
    </span>
);

const ExpandableText = ({ text, onExpand }: ExpandableTextProps) => {
    return (
        <Paragraph
            ellipsis={{
                onExpand: onExpand,
                rows: 2,
                expandable: "collapsible",
                symbol: (expanded) =>
                    expanded ? collapseSymbol : expandSymbol,
            }}
        >
            {text}
        </Paragraph>
    );
};
export default ExpandableText;
