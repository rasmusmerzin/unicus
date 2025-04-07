export function isClass(obj: any) {
  return (
    typeof obj === "function" &&
    Object.toString.call(obj).substring(0, 5) === "class"
  );
}
