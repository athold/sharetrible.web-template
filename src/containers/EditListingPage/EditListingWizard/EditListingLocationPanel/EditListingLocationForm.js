import React, { useEffect, useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
} from '../../../../util/validators';

// Import shared components
import {
  Form,
  FieldLocationAutocompleteInput,
  Button,
  FieldTextInput,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingLocationForm.module.css';

const identity = v => v;

export const EditListingLocationForm = ({ publicData, ...props }) => {
  const [address, setAddress] = useState(null);
  const [isAddressSet, setIsAddressSet] = useState(false);

  useEffect(() => {
    const fetchAddressData = async () => {
      if (publicData?.imonesKodas) {

        try {
          const response = await fetch(
            `https://api.kapitalistai.lt/web/company/getData?companyCode=${publicData.imonesKodas}`
          );

          if (response.ok) {
            const data = await response.json();
            const fullTextAddress = data?.body?.companyData?.data?.registrationAddress?.fullTextAddress;

            if (fullTextAddress) {
              setAddress(fullTextAddress);
            }
          }
        } catch (error) {
          console.error('Error during API call:', error);
        }
      }
    };

    fetchAddressData();
  }, [publicData?.imonesKodas]);

  return (
    <FinalForm
      {...props}
      render={formRenderProps => {
        const {
          form,
          formId = 'EditListingLocationForm',
          autoFocus,
          className,
          rootClassName,
          disabled,
          ready,
          handleSubmit,
          invalid,
          pristine,
          saveActionMsg,
          updated,
          updateInProgress = false,
          fetchErrors,
          values,
        } = formRenderProps;

        const intl = useIntl();
        const { updateListingError, showListingsError } = fetchErrors || {};
        const classes = classNames(rootClassName || css.root, className);
        const submitReady = (updated && pristine) || ready;
        const submitInProgress = updateInProgress;
        const submitDisabled = invalid || disabled || submitInProgress;
        const location = publicData?.location || {};

        useEffect(() => {
          if (address && !isAddressSet) {
            form.change('location', { search: address });
            setIsAddressSet(true);
          }
        }, [address, isAddressSet, form]);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {updateListingError && (
              <p className={css.error}>
                <FormattedMessage id="EditListingLocationForm.updateFailed" />
              </p>
            )}

            {showListingsError && (
              <p className={css.error}>
                <FormattedMessage id="EditListingLocationForm.showListingFailed" />
              </p>
            )}

            <FieldLocationAutocompleteInput
              rootClassName={css.locationAddress}
              inputClassName={css.locationAutocompleteInput}
              iconClassName={css.locationAutocompleteInputIcon}
              predictionsClassName={css.predictionsRoot}
              validClassName={css.validLocation}
              autoFocus={autoFocus}
              name="location"
              label={intl.formatMessage({ id: 'EditListingLocationForm.address' })}
              placeholder={intl.formatMessage({
                id: 'EditListingLocationForm.addressPlaceholder',
              })}
              useDefaultPredictions={false}
              format={identity}
              valueFromForm={values.location || { search: address || location.search || '' }}
            />

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default EditListingLocationForm;
