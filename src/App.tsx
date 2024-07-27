import { createSignal, createEffect } from "solid-js";
import { createFilter } from "@kobalte/core";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
} from "@/components/ui/combobox";
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import { Alert, AlertDescription, AlertTitle,  } from "@/components/ui/alert";


import "./App.css";
import { executeAwsCommand, queuesCommand } from "@/utils/aux-functions";


function sendMessages(fileContent: string | ArrayBuffer | null, selectedItem: string | null) {
  const formatUrl = "http://localhost:4568/000000000000/" + selectedItem;
  const sendMessageCommand = `aws sqs --endpoint-url=http://localhost:4568 --region=us-east-1 send-message --queue-url ${formatUrl} --message-body '${fileContent}'`;

  executeAwsCommand(sendMessageCommand, (result) => {
    console.log("Sending messages", result);
  });
}

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

  createEffect(() => {
    executeAwsCommand(queuesCommand, (result) => {
      setQueuesJsonContent(result as any);
    });
  }, [queuesCommand]);

  return (
    <div class="container">
      <Combobox
        options={queuesJson()}
        placeholder="Select a queue to send messages..."
        onChange={(value) => setSelectedItem(value)}
        itemComponent={(props) => (
          <ComboboxItem item={props.item}>{props.item.rawValue}</ComboboxItem>
        )}
      >
        <ComboboxTrigger>
          <ComboboxInput class="w-full" />
        </ComboboxTrigger>
        <ComboboxContent />
      </Combobox>

      <TextFieldRoot class="w-full max-w-xs">
        <TextFieldLabel>Message File</TextFieldLabel>
        <TextField type="file" class="dark" onChange={handleFileChange} />
      </TextFieldRoot>
      <Button onClick={() => sendMessages(fileContent(), selectedItem())}>
        Send Message
      </Button>

      <Alert>
        <AlertTitle>{queuesJson()}</AlertTitle>
        <AlertDescription>
          You can not add components and dependencies to your app using the cli,
          yet.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default App;
