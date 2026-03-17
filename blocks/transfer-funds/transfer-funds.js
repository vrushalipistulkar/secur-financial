export default async function decorate(block) {
  const formDef = {
    id: "transfer-funds",
    fieldType: "form",
    appliedCssClassNames: "transfer-funds-form",
    items: [
      {
        id: "heading-transfer-funds",
        fieldType: "heading",
        label: { value: "Transfer funds" },
        appliedCssClassNames: "col-12",
      },
      {
        id: "panel-main",
        name: "main",
        fieldType: "panel",
        items: [
          {
            id: "transfer-from",
            name: "transferFrom",
            fieldType: "drop-down",
            label: { value: "Transfer from" },
            enum: ["Checking Account"],
            properties: { colspan: 12 },
          },
          {
            id: "transfer-to",
            name: "transferTo",
            fieldType: "drop-down",
            label: { value: "Transfer to" },
            enum: ["Select account"],
            properties: { colspan: 12 },
          },
          {
            id: "amount",
            name: "amount",
            fieldType: "text-input",
            label: { value: "Amount" },
            value: "$100.00",
            properties: { colspan: 12 },
          },
          {
            id: "submit-btn",
            name: "submitButton",
            fieldType: "button",
            buttonType: "submit",
            label: { value: "Submit" },
            appliedCssClassNames: "submit-wrapper col-12",
          },
        ],
      },
    ],
  };

  const formContainer = document.createElement("div");
  formContainer.className = "form";

  const pre = document.createElement("pre");
  const code = document.createElement("code");
  code.textContent = JSON.stringify(formDef);
  pre.append(code);
  formContainer.append(pre);
  block.replaceChildren(formContainer);

  const formModule = await import("../form/form.js");
  await formModule.default(formContainer);
}
