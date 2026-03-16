/**
 * Loan Preapproval Form block – 3-step wizard, adaptive form only.
 * Step 1: First name, Last name, Email, Phone + phone consent text.
 * Step 2: Address, State, ZIP, City, Country + authorization checkbox.
 * Step 3: Upload documents (Proof of Income, Utility Bill, Employment Verification) + Submit.
 * No fields are mandatory. Back / step indicator / Next or Submit.
 */

import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import { dispatchCustomEvent } from '../../scripts/custom-events.js';
import { syncFormDataLayer, DEFAULT_FORM_FIELD_MAP } from '../../scripts/form-data-layer.js';

function applyButtonConfigToSubmitButton(block, config) {
  const submitButton = block.querySelector("form button[type='submit']");
  if (!submitButton) return;
  const eventType = config.buttoneventtype ?? config['button-event-type'];
  if (eventType && String(eventType).trim()) submitButton.dataset.buttonEventType = String(eventType).trim();
  const webhookUrl = config.buttonwebhookurl ?? config['button-webhook-url'];
  if (webhookUrl && String(webhookUrl).trim()) submitButton.dataset.buttonWebhookUrl = String(webhookUrl).trim();
  const formId = config.buttonformid ?? config['button-form-id'];
  if (formId && String(formId).trim()) submitButton.dataset.buttonFormId = String(formId).trim();
  const buttonData = config.buttondata ?? config['button-data'];
  if (buttonData && String(buttonData).trim()) submitButton.dataset.buttonData = String(buttonData).trim();
}

function buildLoanPreapprovalFormDef() {
  const stateOptions = ['', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const stateNames = ['Select...', ...stateOptions.slice(1)];
  return {
    id: 'loan-preapproval-form',
    fieldType: 'form',
    appliedCssClassNames: 'loan-preapproval-form-form loan-preapproval-form-wizard',
    items: [
      {
        id: 'heading-loan-preapproval',
        fieldType: 'heading',
        label: { value: 'Preapproval Letter Application' },
        appliedCssClassNames: 'col-12 loan-preapproval-form-heading',
      },
      {
        id: 'panel-wizard',
        name: 'wizard',
        fieldType: 'panel',
        ':type': 'fd/panel/wizard',
        items: [
          {
            id: 'step-personal',
            name: 'personal',
            fieldType: 'panel',
            label: { value: 'Personal Information' },
            items: [
              { id: 'firstName', name: 'firstName', fieldType: 'text-input', label: { value: 'First name' }, properties: { colspan: 6 } },
              { id: 'lastName', name: 'lastName', fieldType: 'text-input', label: { value: 'Last name' }, properties: { colspan: 6 } },
              { id: 'email', name: 'email', fieldType: 'email', label: { value: 'Email address' }, properties: { colspan: 12 } },
              { id: 'phone', name: 'phone', fieldType: 'text-input', label: { value: 'Phone number' }, properties: { colspan: 12 } },
              {
                id: 'phone-consent',
                fieldType: 'plain-text',
                value: "By entering your phone number you're authorizing SecurFinancial to use this number to call, text and send you messages by any method. We won't charge you for any messages but your service provider may.",
                appliedCssClassNames: 'col-12 loan-preapproval-form-consent',
              },
            ],
          },
          {
            id: 'step-address',
            name: 'address',
            fieldType: 'panel',
            label: { value: 'Address' },
            items: [
              { id: 'streetAddress', name: 'streetAddress', fieldType: 'text-input', label: { value: 'Address' }, properties: { colspan: 12 } },
              {
                id: 'state',
                name: 'state',
                fieldType: 'drop-down',
                label: { value: 'State' },
                enum: stateOptions,
                enumNames: stateNames,
                properties: { colspan: 12 },
              },
              { id: 'zipCode', name: 'zipCode', fieldType: 'text-input', label: { value: 'ZIP code' }, properties: { colspan: 6 } },
              { id: 'city', name: 'city', fieldType: 'text-input', label: { value: 'City' }, properties: { colspan: 6 } },
              {
                id: 'country',
                name: 'country',
                fieldType: 'drop-down',
                label: { value: 'Country' },
                enum: ['', 'US', 'CA', 'MX', 'GB', 'OTHER'],
                enumNames: ['Select...', 'United States of America', 'Canada', 'Mexico', 'United Kingdom', 'Other'],
                properties: { colspan: 12 },
              },
              {
                id: 'authorize',
                name: 'authorize',
                fieldType: 'checkbox',
                label: { value: "I authorize SecurFinancial to verify my credit. I've read and agreed to Mortgage's Terms of Use, Privacy Policy and Consent to Receive Electronic Documents." },
                enum: ['on'],
                properties: { colspan: 12 },
              },
            ],
          },
          {
            id: 'step-documents',
            name: 'documents',
            fieldType: 'panel',
            label: { value: 'Upload Documents' },
            items: [
              {
                id: 'upload-instruction',
                fieldType: 'plain-text',
                value: 'Upload documents',
                appliedCssClassNames: 'col-12 loan-preapproval-form-upload-label',
              },
              {
                id: 'proofOfIncome',
                name: 'proofOfIncome',
                fieldType: 'file-input',
                label: { value: 'Proof of Income' },
                type: 'file',
                accept: ['image/*', 'application/pdf'],
                properties: { colspan: 12 },
              },
              {
                id: 'utilityBill',
                name: 'utilityBill',
                fieldType: 'file-input',
                label: { value: 'Utility Bill' },
                type: 'file',
                accept: ['image/*', 'application/pdf'],
                properties: { colspan: 12 },
              },
              {
                id: 'employmentVerification',
                name: 'employmentVerification',
                fieldType: 'file-input',
                label: { value: 'Employment Verification' },
                type: 'file',
                accept: ['image/*', 'application/pdf'],
                properties: { colspan: 12 },
              },
              {
                id: 'submit-preapproval-btn',
                name: 'submitPreapproval',
                fieldType: 'button',
                buttonType: 'submit',
                label: { value: 'Submit' },
                appliedCssClassNames: 'loan-preapproval-form-submit-btn',
              },
            ],
          },
        ],
      },
    ],
  };
}

function collectLoanPreapprovalFormData(form) {
  const data = {};
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    const name = el.getAttribute('name');
    if (!name) return;
    if (el.type === 'checkbox') {
      data[name] = el.checked;
    } else if (el.type === 'file') {
      data[name] = el.files?.length ? Array.from(el.files).map((f) => f.name) : [];
    } else {
      data[name] = el.value || '';
    }
  });
  return data;
}

function attachLoanPreapprovalFormSubmitHandler(block) {
  const form = block.querySelector('form');
  if (!form) return;

  const submitSection = form.querySelector('#step-documents')?.closest('fieldset') || form.querySelector('.panel-wrapper:last-of-type');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data = collectLoanPreapprovalFormData(form);
    // eslint-disable-next-line no-console
    console.log('Loan preapproval form data:', data);

    const msg = block.querySelector('.loan-preapproval-form-success-msg');
    if (msg) msg.remove();
    const success = document.createElement('p');
    success.className = 'loan-preapproval-form-success-msg';
    success.textContent = 'Thank you. Your preapproval application has been submitted successfully.';
    success.setAttribute('role', 'status');
    if (submitSection) {
      submitSection.insertBefore(success, submitSection.firstChild);
    } else {
      form.insertBefore(success, form.firstChild);
    }
  });
}

function setupLoanPreapprovalStepIndicator(block) {
  const wizard = block.querySelector('form .wizard');
  if (!wizard) return;
  const totalSteps = wizard.querySelectorAll('.panel-wrapper').length;
  const btnWrapper = wizard.querySelector('.wizard-button-wrapper');
  if (!btnWrapper || totalSteps === 0) return;

  const stepLabel = document.createElement('span');
  stepLabel.className = 'loan-preapproval-form-step-label';
  stepLabel.setAttribute('aria-live', 'polite');
  function updateStepLabel() {
    const current = wizard.querySelector('.current-wizard-step');
    const idx = current ? (parseInt(current.dataset.index, 10) + 1) : 1;
    stepLabel.textContent = `${idx}/${totalSteps} step`;
  }
  updateStepLabel();
  wizard.addEventListener('wizard:navigate', updateStepLabel);

  const nextBtn = btnWrapper.querySelector('.wizard-button-next, [id*="wizard-button-next"]');
  if (nextBtn) btnWrapper.insertBefore(stepLabel, nextBtn);
  else btnWrapper.appendChild(stepLabel);

  const submitWrapper = wizard.querySelector('.submit-wrapper');
  if (submitWrapper) btnWrapper.appendChild(submitWrapper);

  const form = block.querySelector('form');
  attachLoanPreapprovalFormStepEvents(wizard, form);
}

function getLoanPreapprovalWizardStepIndex(wizard) {
  const current = wizard.querySelector('.current-wizard-step');
  if (current && typeof current.dataset.index !== 'undefined') {
    const index = Number.parseInt(current.dataset.index, 10);
    if (!Number.isNaN(index)) return index;
  }
  const first = wizard.querySelector('.panel-wrapper');
  if (first && typeof first.dataset.index !== 'undefined') {
    const fallbackIndex = Number.parseInt(first.dataset.index, 10);
    if (!Number.isNaN(fallbackIndex)) return fallbackIndex;
  }
  return 0;
}

function attachLoanPreapprovalFormStepEvents(wizard, form) {
  if (!wizard) return;
  const handleNavigation = (event) => {
    const index = Number.isFinite(event?.detail?.currStep?.index)
      ? event.detail.currStep.index
      : getLoanPreapprovalWizardStepIndex(wizard);
    if (form) {
      syncFormDataLayer(form, DEFAULT_FORM_FIELD_MAP);
    }
    const prevIndex = Number.isFinite(event?.detail?.prevStep?.index)
      ? event.detail.prevStep.index
      : index - 1;
    if (Number.isFinite(prevIndex) && index > prevIndex) {
      dispatchCustomEvent('form-step');
    }
  };
  wizard.addEventListener('wizard:navigate', handleNavigation);
  if (form) {
    syncFormDataLayer(form, DEFAULT_FORM_FIELD_MAP);
  }
  dispatchCustomEvent('form-start');
}

export default async function decorate(block) {
  const config = readBlockConfig(block) || {};
  [...block.children].forEach((row) => { row.style.display = 'none'; });

  block.classList.add('loan-preapproval-form-block');

  const codeBasePath = window.hlx?.codeBasePath || '';
  await loadCSS(`${codeBasePath}/blocks/form/form.css`);

  const formDef = buildLoanPreapprovalFormDef();
  const formContainer = document.createElement('div');
  formContainer.className = 'loan-preapproval-form-wrapper form';

  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = JSON.stringify(formDef);
  pre.append(code);
  formContainer.append(pre);
  block.append(formContainer);

  const formModule = await import('../form/form.js');
  await formModule.default(formContainer);

  setTimeout(() => {
    applyButtonConfigToSubmitButton(block, config);
    attachLoanPreapprovalFormSubmitHandler(block);
    setupLoanPreapprovalStepIndicator(block);
  }, 100);
}
