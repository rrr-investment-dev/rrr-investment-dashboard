import { useOutlet } from "react-router-dom";
import RoleTypeTabs from "@/components/admin/role-types/RoleTypeTabs";

const AdminUserRoleTypeMaster = () => {
  const outlet = useOutlet(); // Returns the child element if one exists
  return (
    <>
      {!outlet && <RoleTypeTabs />}
      {outlet}
    </>
  );
};

export default AdminUserRoleTypeMaster;
