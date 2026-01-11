module.exports=[32103,a=>{"use strict";var b=a.i(63718),c=a.i(8122);async function d(){let a=await (0,c.createClient)(),{count:b}=await a.from("assignments").select("*",{count:"exact",head:!0}).eq("status","confirmed"),{count:d}=await a.from("assignments").select("*",{count:"exact",head:!0}).eq("status","pending"),e=(b||0)+(d||0),f=e>0?Math.round((b||0)/e*100):0;return{confirmed:b||0,pending:d||0,confirmationRate:f}}async function e(){let a=await (0,c.createClient)(),{data:b}=await a.from("schedules").select(`
            *,
            ministries(*),
            service_times(*),
            assignments(
                *,
                profiles(name, role, avatar_url)
            )
        `).order("date",{ascending:!0}).limit(3);return b||[]}(0,a.i(49682).ensureServerEntryExports)([d,e]),(0,b.registerServerReference)(d,"007e26799dc6789170684d7742e82a32a69e9407fb",null),(0,b.registerServerReference)(e,"00003a7bd517c528d070944b580196dee4c1997e5f",null),a.s(["fetchActiveSchedules",()=>e,"fetchLeaderStats",()=>d])}];

//# sourceMappingURL=Desktop_GIL%20CLEBER_SERVIR_serving-app_src_actions_leader_ts_ba5ba9b5._.js.map