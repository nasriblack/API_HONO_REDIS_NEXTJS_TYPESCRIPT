"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{
    results: string[];
    duration: number;
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!input) return setSearchResults(undefined);

      const res = await fetch(`/api/search?q=${input}`);
    };

    fetchData();

    // return () => {

    // }
  }, [input]);

  return (
    <>
      <input
        className="text-zinc-900"
        value={input}
        type="text"
        name=""
        id=""
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
    </>
  );
}
