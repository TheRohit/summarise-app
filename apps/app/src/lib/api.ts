export async function getSummary(id: string) {
  const response = await fetch(`/api/transcribe?id=${id}`);
  if (!response.ok) {
    console.log(response);
    throw new Error("Network response was not ok");
  }
  return response.json();
}
