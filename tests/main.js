const { iRecharge } = require("../lib/index");
const config = require("./config.json");

const IR = new iRecharge(config);

const run = async ()=>{
    try {
        let databundles = await IR.Data.getBundles({
            //reference_id: 12334455554,
            data_network: 'Smile'
        });
        console.log(JSON.stringify(databundles));
        // let discos = await IR.Power.getDiscos();
        // console.log(JSON.stringify(discos));
        // let airtime = await IR.Airtime.vend({
        //     vtu_amount: 1000,
        //     vtu_email: "peter@celd.ng",
        //     vtu_network: "MTN",
        //     vtu_number: "2349065961820",
        //     reference_id: 123456790588,
        //     vendor_code: '1808708334'
        // });
        // console.log(JSON.stringify(airtime));
        let tv  =  await IR.Tv.getBouquets({
            tv_network: "DSTV"
        });
        console.log(JSON.stringify(tv));
    } catch (error) {
        console.log(error);
    }
}

run();