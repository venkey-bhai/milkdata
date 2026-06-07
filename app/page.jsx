import { redirect } from "next/navigation";

export default function Home() {

  redirect("/Register");
}

// export default function Home() {

//   return (

//     <div className="flex justify-center items-center h-screen">

//       <h1 className="text-4xl font-bold text-blue-600">

//         Milk Buyer Management App

//       </h1>

//     </div>
//   );
// }