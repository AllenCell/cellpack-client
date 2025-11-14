import { Typography } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import "./style.css";

const { Paragraph } = Typography;

interface ExpandableTextProps {
    text: string;
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

export const ExpandableText = ({ text }: ExpandableTextProps) => {
    return (
        <Paragraph
            style={{ marginBottom: 0 }}
            ellipsis={{
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