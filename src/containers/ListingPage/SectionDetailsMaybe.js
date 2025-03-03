import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { isFieldForListingType } from '../../util/fieldHelpers';

import { Heading } from '../../components';

import css from './ListingPage.module.css';

const SectionDetailsMaybe = props => {
  const { publicData, metadata = {}, listingFieldConfigs, isFieldForCategory, intl } = props;

  if (!publicData || !listingFieldConfigs) {
    return null;
  }

  const pickListingFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, showConfig = {} } = config;
    const listingType = publicData.listingType;
    const isTargetListingType = isFieldForListingType(listingType, config);
    const isTargetCategory = isFieldForCategory(config);

    const { isDetail, label } = showConfig;
    const publicDataValue = publicData[key];
    const metadataValue = metadata[key];
    const value = typeof publicDataValue != null ? publicDataValue : metadataValue;

    if (isDetail && isTargetListingType && isTargetCategory && typeof value !== 'undefined') {
      const findSelectedOption = enumValue => enumOptions?.find(o => enumValue === `${o.option}`);
      const getBooleanMessage = value =>
        value
          ? intl.formatMessage({ id: 'SearchPage.detailYes' })
          : intl.formatMessage({ id: 'SearchPage.detailNo' });
      const optionConfig = findSelectedOption(value);

      return schemaType === 'enum'
        ? filteredConfigs.concat({ key, value: optionConfig?.label, label })
        : schemaType === 'boolean'
          ? filteredConfigs.concat({ key, value: getBooleanMessage(value), label })
          : schemaType === 'long'
            ? filteredConfigs.concat({ key, value, label })
            : filteredConfigs;
    }
    return filteredConfigs;
  };

  const existingListingFields = listingFieldConfigs.reduce(pickListingFields, []);

  return existingListingFields.length > 0 ? (
    <section className={css.sectionDetails}>

      {/* <Heading as="h2" rootClassName={css.sectionHeading}>
        <FormattedMessage id="ListingPage.detailsTitle" />
      </Heading> */}
      <ul className={css.details}>
        <li id="field_0" className={css.detailsRow}>
          <span className={css.detailLabel}>Įmonės kodas:</span>
          <span>{publicData.imonesKodas}</span>
        </li>
        <li id="field_1" className={css.detailsRow}>
          <span className={css.detailLabel}>Veiklos sritis:</span>
          <span>
            {publicData.industry
              ? publicData.industry.charAt(0).toUpperCase() + publicData.industry.slice(1)
              : ""}
          </span>

        </li>
        <li id="field_2" className={css.detailsRow}>
          <span className={css.detailLabel}>Darbuotojų skaičius šiandien:</span>
          <span>{publicData.darbuotoju}</span>
        </li>


        <li id="field_3" className={css.detailsRow}>
          <span className={css.detailLabel}>Paskutinių metų apyvarta:</span>
          <span>
            {publicData.metines_pajamos ? `${publicData.metines_pajamos} €` : ""}
          </span>
        </li>
        <li id="field_4" className={css.detailsRow}>
          <span className={css.detailLabel}>Paskutinių metų pelnas:</span>
          <span>
            {publicData.pelnas ? `${publicData.pelnas} €` : ""}
          </span>
        </li>

        <li id="field_5" className={css.detailsRow}>
          <span className={css.detailLabel}>Parduodama akcijų dalis:</span>
          <span>{publicData.akciju_dalis ? `${publicData.akciju_dalis} %` : ""}</span>
        </li>
        <li id="field_6" className={css.detailsRow}>
          <span className={css.detailLabel}>Teisinė forma:</span>
          <span>{publicData.teisine_forma}</span>
        </li>
        <li id="field_7" className={css.detailsRow}>
          <span className={css.detailLabel}>Registracijos šalis:</span>
          <span>
            Lietuva
          </span>
        </li>
        <li id="field_8" className={css.detailsRow} style={{ paddingBottom: "25px" }}>
          <span className={css.detailLabel}>Centrinė būstinė:</span>
          <span>
            {publicData?.location?.address
              ? publicData.location.address
              : "Nėra duomenų"}
          </span>
        </li>
      </ul>
    </section>
  ) : null;
};

export default SectionDetailsMaybe;
