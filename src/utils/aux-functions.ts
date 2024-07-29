import { invoke } from "@tauri-apps/api/tauri";

export async function executeAwsCommand(
  command: string,
  resultHandler: (result: string) => void
) {
  try {
    console.log("Executing", command)
    const result: string = await invoke("run_aws_cli_command", { command });
    console.log("result", result)
    const data = JSON.parse(result);

    const updatedUrls = data.QueueUrls.map((url: string) =>
      url.replace("http://localhost:4568/000000000000/", "")
    );

    resultHandler(updatedUrls);
  } catch (error) {
    console.error("Error invoking command:", error);
  }
}


export async function sendMessageAwsCommand(
  command: string,
  resultHandler: (result: string) => void
) {
  try {
    const result: string = await invoke("run_aws_cli_command", { command });

    resultHandler(result);
  } catch (error) {
    console.error("Error invoking command:", error);
  }
}


export const queuesCommand =
  "aws sqs list-queues --endpoint-url=http://localhost:4568 --region=us-east-1";
