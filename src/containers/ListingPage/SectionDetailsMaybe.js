import React, { useState, useEffect } from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { isFieldForListingType } from '../../util/fieldHelpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import SectionTextMaybe from './SectionTextMaybe';

import { Heading, H2 } from '../../components';

import css from './ListingPage.module.css';

const SectionDetailsMaybe = props => {
  const { publicData, metadata = {}, listingFieldConfigs, isFieldForCategory, intl, description } = props;

  if (!publicData || !listingFieldConfigs) {
    return null;
  }

  const currentListingCompanyCode = publicData.imonesKodas;

  const [financialData, setFinancialData] = useState([]);

  useEffect(() => {
    if (!currentListingCompanyCode) return;

    fetch(`https://api.kapitalistai.lt/web/company/getFinancialData?companyCode=${currentListingCompanyCode}`)
      .then(response => response.json())
      .then(body => {
        console.log(body);
        if (
          body.body &&
          body.body.financialData &&
          body.body.financialData.data &&
          body.body.financialData.data.financialRatios
        ) {
          const ratios = body.body.financialData.data.financialRatios;

          const chartData = ratios.map(entry => ({
            name: entry.financialYear.toString(),
            value1: entry.turnover || 0,
            value2: entry.profitBeforeTax || 0,
          }));
          setFinancialData(chartData);
        } else {
          console.error("Financial Ratios not found in response");
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, [currentListingCompanyCode]);

  const filteredData = financialData.filter(d => d.value1 > 0 || d.value2 > 0);

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
    // <section className={css.sectionDetails}>
    //   <Heading as="h2" rootClassName={css.sectionHeading}>
    //     <FormattedMessage id="ListingPage.detailsTitle" />
    //   </Heading>
    //   <ul className={css.details}>
    //     {existingListingFields.map(detail => (
    //       <li key={detail.key} className={css.detailsRow}>
    //         <span className={css.detailLabel}>{detail.label}</span>
    //         <span>{detail.value}</span>
    //       </li>
    //     ))}
    //   </ul>
    // </section>
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
            {publicData?.pagrindinis_adresas || publicData?.location?.address || "Nėra duomenų"}
          </span>
        </li>
      </ul>
      <Heading as={H2} style={{ fontSize: '14px' }} rootClassName={css.customHeading} >
        Verslo aprašymas
      </Heading>
      <SectionTextMaybe text={description} showAsIngress />
      <div className="p-4">
        <Heading as={H2} style={{ fontSize: '14px', marginBottom: '5px' }} rootClassName={css.customHeading} >
          Apyvartos grafikas
        </Heading>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={filteredData}
            margin={{ left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis width={80} />
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ top: -5 }} />
            <Bar dataKey="value1" fill="#084aad" barSize={20} name="Pardavimo pajamos" />
            <Bar dataKey="value2" fill="#f59d05" barSize={20} name="Pelnas (nuostoliai) prieš mokeščius" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  ) : null;
};

export default SectionDetailsMaybe;
