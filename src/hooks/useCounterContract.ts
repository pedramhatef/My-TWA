import { useEffect, useState } from 'react';
import Counter from '../contracts/counter';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from './useTonConnect';
import { Address, OpenedContract } from '@ton/core';

export function useCounterContract() {
    const client = useTonClient();
    const [val, setVal] = useState<null | string>();
    const { sender } = useTonConnect();

    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

    const counterContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new Counter(
            Address.parse('EQB8btgnEV-tHjw1Xw4j6vk0HRFZZDd1vp1XK6WwO4wL3hqi') // replace with your address from tutorial 2 step 8
        );
        return client.open(contract) as OpenedContract<Counter>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!counterContract) return;
            setVal(null);
            const val = await counterContract.getCounter();
            setVal(val.toString());
            await sleep(5000); // sleep 5 seconds and poll value again
            getValue();
        }
        getValue();
    }, [counterContract]);

    return {
        value: val,
        address: counterContract?.address.toString(),
        sendIncrement: () => {
            return counterContract?.sendIncrement(sender);
        },
    };
}
