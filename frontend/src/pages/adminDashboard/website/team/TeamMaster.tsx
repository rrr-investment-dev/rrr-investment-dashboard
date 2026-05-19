import { Outlet, useOutlet } from "react-router-dom";
import TeamTabs from "@/components/admin/website/team/TeamTabs";

const TeamMaster = () => {
  const outlet = useOutlet();
  return (
    <>
      {!outlet && <TeamTabs />}
      <Outlet />
    </>
  );
};

export default TeamMaster;
