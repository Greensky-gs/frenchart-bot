import { AutocompleteListener } from 'amethystjs';
import { shop } from '../utils/query';

export default new AutocompleteListener({
    listenerName: 'item',
    commandName: [{ commandName: 'magasin' }],
    run: ({ focusedValue }) => {
        const items = shop.items
            .filter((x) => shop.isBuyable(x.id))
            .filter(
                (x) =>
                    x.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
                    focusedValue.toLowerCase().includes(x.name.toLowerCase())
            );
        return items
            .map((x) => ({ name: `${x.name} - ${x.type === 'role' ? 'rôle' : 'texte'}`, value: x.id.toString() }))
            .splice(0, 24);
    }
});
