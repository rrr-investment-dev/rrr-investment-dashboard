import { Outlet, useOutlet } from "react-router-dom";
import PostTabs from "@/components/admin/website/posts/PostTabs";

const PostMaster = () => {
  const outlet = useOutlet();
  return (
    <>
      {!outlet && <PostTabs />}
      <Outlet />
    </>
  );
};

export default PostMaster;
