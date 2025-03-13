import React from 'react';
import classNames from 'classnames';
import { ListingPageComponent } from '../../containers/ListingPage/ListingPageCarousel';
import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { displayPrice } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { formatMoney } from '../../util/currency';
import { ensureListing, ensureOwnListing, ensureUser } from '../../util/data';
import { richText } from '../../util/richText';
import { createSlug } from '../../util/urlHelpers';
import { isBookingProcessAlias } from '../../transactions/transaction';
import { getListingsById } from '../../ducks/marketplaceData.duck';


import { AspectRatioWrapper, NamedLink, ResponsiveImage } from '../../components';

import css from './ListingCard.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;

const priceData = (price, currency, intl) => {
  if (price && price.currency === currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

const PriceMaybe = props => {
  const { price, publicData, config, intl, } = props;
  const { listingType } = publicData || {};
  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  if (!showPrice && price) {
    return null;
  }

  const isBookable = isBookingProcessAlias(publicData?.transactionProcessAlias);
  const { formattedPrice, priceTitle } = priceData(price, config.currency, intl);
  return (
    <div className={css.price}>
      <div className={css.priceValue} title={priceTitle}>
        {formattedPrice}
      </div>
      {isBookable ? (
        <div className={css.perUnit}>
          <FormattedMessage id="ListingCard.perUnit" values={{ unitType: publicData?.unitType }} />
        </div>
      ) : null}
    </div>
  );
};

/**
 * ListingCard
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {Object} props.listing API entity: listing or ownListing
 * @param {string?} props.renderSizes for img/srcset
 * @param {Function?} props.setActiveListing
 * @param {boolean?} props.showAuthorInfo
 * @returns {JSX.Element} listing card to be used in search result panel etc.
 */
export const ListingCard = props => {
  const config = useConfiguration();
  const intl = props.intl || useIntl();
  const {
    className,
    rootClassName,
    listing,
    renderSizes,
    setActiveListing,
    showAuthorInfo = true,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);

  const id = currentListing.id.uuid;
  const { title = '', price, publicData, description } = currentListing.attributes;
  const slug = createSlug(title);
  const author = ensureUser(listing.author);
  const authorName = author.attributes.profile.displayName;

  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const setActivePropsMaybe = setActiveListing
    ? {
      onMouseEnter: () => setActiveListing(currentListing.id),
      onMouseLeave: () => setActiveListing(null),
    }
    : null;


  return (
    <NamedLink className={classes} name="ListingPage" params={{ id, slug }}>
      <AspectRatioWrapper
        className={css.aspectRatioWrapper}
        width={aspectWidth}
        height={aspectHeight}
        {...setActivePropsMaybe}
      >
        {/* <LazyImage
    rootClassName={css.rootForImage}
    alt={title}
    image={firstImage}
    variants={variants}
    sizes={renderSizes}
  /> */}
        <div className={css.myContainer}>
          <div className={css.title}>
            {richText(title, {
              longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
              longWordClass: css.longWord,
            })}
          </div>
          {price ? (
            <PriceMaybe
              price={price}
              publicData={publicData}
              config={config}
              intl={intl}
              className={css.priceValue} // You can pass the class here too
            />
          ) : (
            <div className={css.priceWrapper}>
              <div style={{ fontSize: '1.45em' }}>
                {publicData?.pagrindine_kaina} €
              </div>
            </div>
          )}
        </div>
        <div className={css.wordContainer}>
          <div className={css.leftColumn}>
            <div className={css.row}>
              <span className={css.label}>Apyvarta:</span>
              <span className={css.value}>{publicData.metines_pajamos}€</span>
            </div>

            <div className={css.row}>
              <span className={css.label}>Pelnas:</span>
              <span className={css.value}>{publicData.pelnas}€</span>
            </div>
          </div>

          <div className={css.rightColumn}>
            <div className={css.redSquare}>
              <span className={css.centeredText}>Peržiurėti</span>
            </div>
          </div>

          <div className={css.fullWidth}>
            <span>{currentListing.attributes.description}</span>
          </div>
        </div>





      </AspectRatioWrapper>

      {/* <div className={css.info}>
        <PriceMaybe price={price} publicData={publicData} config={config} intl={intl} />
        <div className={css.mainInfo}>
          <div className={css.title}>
            {richText(title, {
              longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
              longWordClass: css.longWord,
            })}
          </div>
          {showAuthorInfo ? (
            <div className={css.authorInfo}>
              <FormattedMessage id="ListingCard.author" values={{ authorName }} />
            </div>
          ) : null}
        </div>
      </div> */}
    </NamedLink>
  );
};

export default ListingCard;
