// src/components/skeltons/MenuListSkeleton.tsx
import React, { useMemo, useRef } from "react";
import { FlatList } from "react-native";
import MenuRowSkeleton from "./MenuRowSkeleton";
import { hp } from "@/src/assets/utils/responsive";

const DEFAULT_ROWS = 6;

const MenuListSkeleton: React.FC<{ rows?: number; rowHeight?: number }> = ({ rows = DEFAULT_ROWS, rowHeight = Math.round(hp(12)) }) => {
  const data = useMemo(() => Array.from({ length: rows }), [rows]);
  const ref = useRef<FlatList<any> | null>(null);

  return (
    <FlatList
      ref={ref}
      data={data}
      keyExtractor={(_, i) => `menu-skel-${i}`}
      renderItem={() => <MenuRowSkeleton />}
      ItemSeparatorComponent={() => <></>}
      scrollEnabled={false} // parent FlatList handles scroll in CategoryDetailScreen
    />
  );
};

export default React.memo(MenuListSkeleton);
