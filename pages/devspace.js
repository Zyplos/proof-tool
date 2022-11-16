import MainLayout from "../components/MainLayout";
import Fullbox from "../components/Fullbox";
import { Button } from "../components/Button";
import { signIn } from "next-auth/react";
import Toggle from "../components/Toggle";
import { useState } from "react";

export default function MePage() {
  const [value, setValue] = useState(false);

  return (
    <MainLayout>
      <h1>dev</h1>
      <p>space</p>
      <Toggle labelText={"Print Mode"} isChecked={value} handleToggle={() => setValue(!value)} />
      <p>{value ? "on!" : "off"}</p>
    </MainLayout>
  );
}
