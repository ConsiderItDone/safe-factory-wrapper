import v130l2 from "./1.3.0/gnosis_safe_l2";

const v100contractNames = ['gnosis_safe'];
const v111contractNames = ['create_and_add_modules', 'create_call','default_callback_handler', 'gnosis_safe', 'multi_send', 'proxy_factory'];
const v120contractNames = ['gnosis_safe'];
const v130contractNames = ['compability_fallback_handler', 'create_call', 'gnosis_safe', 'gnosis_safe_l2', 'multi_send', 'multi_send_call_only', 'proxy_factory', 'simulate_tx_accessor']

function generateMap<K = string, V = string>(values: string[][]): Map<K, V> {
  const map = new Map<K, V>();

  for (let i = 0; i < values.length; i++) {
    const key = <K>values[i][0];
    const value = <V>values[i][1];
    map.set(key, value);
  }
  return map;
}

const V130l2 = generateMap<string, string>(v130l2);

type VersionMap = Map<string, Map<string, string>>;

function getVersionMap(): VersionMap {
  const map = new Map<string, Map<string, string>>();
  map.set("1.3.0", V130l2);
  map.set("1.3.0l2", V130l2);
  return map;
}

const versionMap = getVersionMap();

export default versionMap;
