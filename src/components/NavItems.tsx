"use client";

import { PRODUCT_CATAGORIES } from "@/config";
import { useEffect, useRef, useState } from "react";
import NavItem from "./NavItem";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const NavItems = () => {
  const [activeIndex, setActiveIndex] = useState<null | number>(null);

  const isAnyOpen = activeIndex !== null;

  //pressing scape key closes navbar
  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      if(e.key === "Escape"){
        setActiveIndex(null)
      }
    }
    document.addEventListener("keydown", handler)

    //cleanup. Prevents memory leaks
    return() => {
      document.removeEventListener("keydown",handler)
    }
  },[])


  //clicking outside of navbar immediately closes it
  const navRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(navRef, () => setActiveIndex(null))

  return (
    <div className="flex gap-4 h-full" ref={navRef}>
      {PRODUCT_CATAGORIES.map((category, i) => {
        // keeping track of which item in the nev bar is currently open and which one is not
        const handleOpen = () => {
          if (activeIndex === i) {
            setActiveIndex(null);
          } else {
            setActiveIndex(i);
          }
        };

        //this is how we change styling if an item is open or not
        const isOpen = i === activeIndex;

        return (
          //contains each element separately allowing us to style
          <NavItem
            category={category}
            handleOpen={handleOpen}
            isOpen={isOpen}
            key={category.value}
            isAnyOpen={isAnyOpen}
          />
        );
      })}
    </div>
  );
};

export default NavItems;
