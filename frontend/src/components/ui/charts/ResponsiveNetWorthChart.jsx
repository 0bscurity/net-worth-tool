import NetWorthChart from "./NetWorthDoghnutChart";
import NetWorthBarChart from "./NetWorthBarChart";
import { useIsMobile } from "../../../hooks/useIsMobile";

export default function ResponsiveNetWorthChart({ data }) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{ height: "262px", width: "100%" }}
      key={isMobile ? "mobile" : "desktop"}
    >
      {isMobile ? (
        <NetWorthBarChart data={data} />
      ) : (
        <NetWorthChart data={data} />
      )}
    </div>
  );
}
