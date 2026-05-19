// import { IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  //   CardAction,
  CardDescription,
  // CardFooter,
  CardHeader,
  //   CardTitle,
  //   CardTitle,
} from "./ui/card";

const SectionCards = ({ title, value }: { title: string; value: number }) => {
  return (
    <>
      <Card className="@container/card">
        <CardHeader>
          {/* <CardTitle className="text-sm font-medium">{title}</CardTitle> */}
          <CardDescription className="text-sm font-medium">
            {title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </>
  );
};

export default SectionCards;
