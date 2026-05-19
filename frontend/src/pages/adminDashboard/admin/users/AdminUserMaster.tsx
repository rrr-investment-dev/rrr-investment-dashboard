import { Outlet, useOutlet } from "react-router-dom";
import UserTabs from "@/components/admin/users/UserTabs";

const AdminUserMaster = () => {
  const outlet = useOutlet(); // Returns the child element if one exists
  return (
    <>
      {!outlet && <UserTabs />} {/* Only show tabs if no child route */}
      <Outlet />
    </>
  );
};

export default AdminUserMaster;
