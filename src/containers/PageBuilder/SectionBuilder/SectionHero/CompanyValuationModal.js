import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import * as validators from '../../../../util/validators';
import { Form, PrimaryButton, FieldTextInput, FieldPhoneNumberInput, FieldCheckbox, Modal } from '../../../../components';

import css from './CompanyValuationModal.module.css';

// Template of success message after successful form submission
const SuccessMessage = ({ onClose }) => (
  <div className={css.successMessage}>
    <p>Jūsų užklausa sėkmingai išsiųsta! Įvertinimą gausite nurodytu el.paštu.</p>
    <PrimaryButton onClick={onClose}>Uždaryti</PrimaryButton>
  </div>
);

// Template of form for company valuation
const ValuationForm = ({ handleSubmitForm, onClose }) => {
  const validateOnlyNumbers = message => value => {
    return /^\d*$/.test(value) ? undefined : message;
  };

  const validateLithuanianPhone = message => value => {
    if (!value) return message; // Patikrina, ar nėra tuščias
      const lithuanianPhoneRegex = /^(\+370)6\d{7}$/;
    return lithuanianPhoneRegex.test(value) ? undefined : message;
  };

  const requiredCheckbox = () => value => !value;
  
  return (
    <FinalForm
      onSubmit={(values) => handleSubmitForm(values, onClose)}

      render={({ handleSubmit, submitting, invalid, submitError, form}) => {
        const submitInProgress = submitting;
        const hasFieldErrors = Object.keys(form.getState().errors).length > 0;
        const submitDisabled = hasFieldErrors || submitInProgress;
        console.log('invalid:', invalid);
        console.log('submitError:', submitError);

        // console.log('submitInProgress:', submitInProgress);
        console.log('submitDisabled:', submitDisabled);

        return (
          <Form onSubmit={handleSubmit}>
            <FieldTextInput
              type="text"
              name="companyCode"
              id="companyCode"
              label="Įmonės kodas"
              maxLength={9}
              validate={validators.composeValidators(
                validators.required('Įmonės kodas yra privalomas.'),
                validators.minLength('Įmonės kodas turi būti 9 simbolių ilgio.', 9),
                validators.maxLength('Įmonės kodas turi būti 9 simbolių ilgio.', 9),
                validateOnlyNumbers('Įmonės kodas turi būti sudarytas tik iš skaitmenų.')
              )}
            />

            <FieldTextInput
              type="text"
              name="fullName"
              id="fullName"
              label="Vardas Pavardė"
              autoComplete="name"
              validate={validators.composeValidators(
                validators.required('Vardas ir pavardė yra privalomi.')
              )}
            />

            <FieldTextInput
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              label="El. paštas"
              validate={validators.composeValidators(
                validators.required('El. paštas yra privalomas.'), 
                validators.emailFormatValid('Netinkamas el. pašto formatas.')
              )}
            />

            <FieldPhoneNumberInput
              name="phone"
              id="phone"
              label="Telefonas"
              autoComplete="tel"
              validate={validators.composeValidators(
                validators.required('Telefonas yra privalomas.'),
                validateLithuanianPhone('Telefonas turi būti +3706xxxxxxx formatu.')
              )}
              placeholder="+3706xxxxxxx"
            />
            <p>
              <FieldCheckbox
                  name="isShareholder"
                  id="isShareholder"
                  label="Aš esu įmonės akcininkas"
                  validate={requiredCheckbox()}
              />
              <FieldCheckbox
                  name="agreeToEmails"
                  id="agreeToEmails"
                  label="Sutinku gauti el. laiškus iš Kapitalistai.lt"
                  validate={requiredCheckbox()}
              />
            </p>

            {submitError && (
              <div className={css.error}>
                <ul>
                  {Array.isArray(submitError) 
                    ? submitError.map((error, index) => <li key={index}>{error}</li>) 
                    : <li>{submitError}</li>}
                </ul>
              </div>
            )}
            <p>
              <PrimaryButton 
                type="submit" 
                inProgress={submitInProgress} 
                disabled={submitDisabled}
              >
                Siųsti
              </PrimaryButton>
            </p>
          </Form>
        );
      }}
    />
  );
}

const CompanyValuationModal = ({ isOpen, onClose }) => {

  const [isSuccess, setIsSuccess] = useState(false);

  const onManageDisableScrolling = (id, shouldDisable) => {
    document.body.style.overflow = shouldDisable ? 'hidden' : 'auto';
  };


  const handleSubmitForm = async (values, onClose) => {
    let errorList = [];
    console.log('Formos pateikimas prasideda...');
  
    try {
      const response = await fetch("https://api.kapitalistai.lt/web/company-valuation-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();

      if (data.statusCode === 400) {
        const errors = JSON.parse(data.body).errors;
        for (let key in errors) {
          errorList.push(errors[key]);
        }
      }
      
      if (errorList.length > 0) {
        return {[FORM_ERROR]: errorList};
      }      
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Įvyko klaida siunčiant duomenis:", error);
      return { 
        [FORM_ERROR]: "Nepavyko prisijungti prie serverio. Bandykite vėliau." 
      };
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} onManageDisableScrolling={onManageDisableScrolling}>
      <h2 className={css.modalTitle}>Įmonės vertinimas</h2>
      {isSuccess ? (
        <SuccessMessage onClose={onClose} />
      ) : (
        <ValuationForm handleSubmitForm={handleSubmitForm} onClose={onClose} />
      )}
    </Modal>
  );
}
  
export default CompanyValuationModal;
