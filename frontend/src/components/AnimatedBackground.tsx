import { useEffect, useState } from "react";

type Props = {
  artworkUrl?: string;
};

export default function AnimatedBackground({
  artworkUrl
}: Props){

  const [currentBg,setCurrentBg] =
      useState("");

  const [visible,setVisible] =
      useState(false);

  useEffect(()=>{

    console.log("Artwork:", artworkUrl);

    if(!artworkUrl) return;

    setVisible(false);

    const timer = setTimeout(()=>{

      setCurrentBg(
        `http://localhost:8080${artworkUrl}`
      );

      setVisible(true);

    },200);

    return ()=>clearTimeout(timer);

  },[artworkUrl]);

  return (
    <div
      className={`animated-bg ${
        visible ? "show" : ""
      }`}
      style={{
        backgroundImage:`url(${currentBg})`
      }}
    />
  );
}