import { useEffect, useState } from "react";

const iconPackLoaders = import.meta.glob("../../../../node_modules/react-icons/*/index.mjs");

const packCache = {};

const loadIconPack = (packName) => {
  if (!packName) return Promise.resolve(null);
  if (packCache[packName]) return packCache[packName];

  const loaderKey = Object.keys(iconPackLoaders).find((key) =>
    key.endsWith(`/react-icons/${packName}/index.mjs`)
  );
  packCache[packName] = loaderKey ? iconPackLoaders[loaderKey]() : Promise.resolve(null);
  return packCache[packName];
};

const getPackName = (iconImport) => iconImport?.split("/")[1] || null;

function DynamicIcon({ iconImport, iconName, ...iconProps }) {
  const [IconComponent, setIconComponent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIconComponent(null);

    loadIconPack(getPackName(iconImport)).then((pack) => {
      if (!cancelled) setIconComponent(() => (pack && iconName ? pack[iconName] : null));
    });

    return () => {
      cancelled = true;
    };
  }, [iconImport, iconName]);

  return IconComponent ? <IconComponent {...iconProps} /> : null;
}

export default DynamicIcon;
