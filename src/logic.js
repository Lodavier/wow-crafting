import { loadData } from './tsm';
import Data from './data';

export default async function calculate(server, faction, valueKey) {
  const data = await loadData(server, faction, valueKey);

  const price = r => Math.min(...[r.vendorPrice, r.marketValue, r.craftingPrice, r.bindOnPickup ? 0 : Infinity].filter(x => !isNaN(x)));

  const results = {};
  function process(item) {
    if (results[item] === "processing") throw Error(`cyclical dependency for ${item}`);
    if (!results[item]) {
      const info = Data[item];
      if (!info) {
        throw Error(`item not found: ${item}`);
      }
      const r = results[item] = {};
      r.id = info.id;
      r.quality = info.quality;
      if (info.id && data[info.id]) {
        Object.assign(r, data[info.id]);
      }
      if (info.vendor) {
        r.vendorPrice = info.vendor;
      }
      r.category = info.category;
      if (info.reagents) {
        r.crafting = info.reagents;
        r.requiredMoney = info.requiredMoney || 0;
        r.amountCrafted = ((info.craftMin || 1) + (info.craftMax || 1)) / 2;
        r.craftMin = info.craftMin || 1;
        r.craftingPrice = Object.entries(r.crafting).reduce((total, [name, quantity]) => total + process(name) * quantity, r.requiredMoney) / r.amountCrafted;
      } else if (info.bindOnPickup) {
        r.bindOnPickup = true;
      }
      if(info.scrollId !== undefined && 
        info.scrollId !== info.id &&
        data[info.scrollId] !== undefined){
        r.marketValue = data[info.scrollId].marketValue
        r.quantity = data[info.scrollId].quantity
      }
    }
    return price(results[item]);
  }
  Object.keys(Data).forEach(n => process(n));
  return results;
}
