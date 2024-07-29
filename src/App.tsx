import { createSignal, createEffect } from "solid-js";

import { Button } from "@/components/ui/button";
import { FileUp, SendHorizontal } from "lucide-solid";

import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import toast, { Toaster } from "solid-toast";
import {
  Command,  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";


import "./App.css";
import {
  executeAwsCommand,
  queuesCommand,
  sendMessageAwsCommand,
} from "@/utils/aux-functions";

function App() {
  const [selectedItem, setSelectedItem] = createSignal<string | null>(null);
  const [queuesJson, setQueuesJsonContent] = createSignal([], {
    equals: false,
  });
  const [fileContent, setFileContent] = createSignal<
    string | ArrayBuffer | null
  >(null);

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result);
      };
      reader.readAsText(file);
    }
  };


  function sendMessages(
    fileContent: string | ArrayBuffer | null,
    selectedItem: string | null
  ) {
    const formatUrl = "http://localhost:4568/000000000000/" + selectedItem;
    const sendMessageCommand = `aws sqs --endpoint-url=http://localhost:4568 --region=us-east-1 send-message --queue-url ${formatUrl} --message-body '${fileContent}' --message-group-id=kiel`;

    const notify = () => toast.success("Mensagem enviada com sucesso.");

    console.log("sendMessage", sendMessageCommand);
    sendMessageAwsCommand(sendMessageCommand, (result) => {
      console.log("Sending messages", result);
          notify();
    });
  }

  createEffect(() => {
    executeAwsCommand(queuesCommand, (result) => {
      setQueuesJsonContent(result as any);
    });
  }, [queuesCommand]);

  return (
    <div class="container">
      <Command>
        <CommandInput
          style={{ color: "#DBDFE8" }}
          placeholder="Search a queue..."
        />
        <CommandList>
          <CommandEmpty style={{ color: "#DBDFE8" }}>
            No results found.
          </CommandEmpty>
          <CommandGroup heading="Suggestions" style={{ color: "#DBDFE8" }}>
            {queuesJson().map((queue, index) => (
              <CommandItem
                key={index}
                onSelect={(queue) => setSelectedItem(queue)}
                classList={{ selected: queue === selectedItem() }}
              >
                {queue}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </Command>

      <TextFieldRoot class="w-full max-w-xs">
        <TextFieldLabel style={{ color: "#DBDFE8", "margin-left": "10px" }}>
          Message File
        </TextFieldLabel>
        <div style={{ "padding": "10px"}}>
          <Button
            style={{ color: "#0b555b" }}
            onClick={() => {
              const input = document.querySelector("input[type=file]");
              if (input) {
                input.click();
              }
            }}
          >
            <FileUp size={18} color="#0b555b" />
            Select File
          </Button>
        </div>
        <TextField
          type="file"
          onChange={handleFileChange}
          style={{ background: "#DBDFE8", display: "none" }}
        />
      </TextFieldRoot>
      <Button
        style={{ color: "#0b555b", "margin-left": "10px" }}
        onClick={() => sendMessages(fileContent(), selectedItem())}
      >
        <SendHorizontal size={18} color="#0b555b" />
        Send Message
      </Button>
      <Toaster />
    </div>
  );
}

export default App;
