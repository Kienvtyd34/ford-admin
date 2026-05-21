export const extractEntities = (text = "") => {
  const t = text.toLowerCase();

  return {
    type:
      t.includes("suv") ? "SUV" :
      t.includes("sedan") ? "Sedan" : null,

    seats:
      /7\s*chỗ/.test(t) ? 7 :
      /5\s*chỗ/.test(t) ? 5 : null,

    budget: (() => {
      const m = t.match(/(\d+)\s*triệu/);
      return m ? Number(m[1]) * 1_000_000 : null;
    })()
  };
};