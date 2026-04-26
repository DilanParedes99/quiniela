export type Post = {
  id: number;
  title: string;
};

export async function getPosts(): Promise<Post[]> {
  return [
    { id: 1, title: "Primer post" },
    { id: 2, title: "Segundo post" },
    { id: 3, title: "Tercer post" },
  ];
}
