/*
    JSMacros Wheat Farm Bot

    @author TheOrangeWizard
    @author BattleDog249
    @contact battledog249@proton.me
    @contact BattleDog249#9512
*/

// Must start at northwest corner! For now...

tool = "minecraft:stick"; // to be used when clicking crops
threshold = 8; // bot will perform a dropoff once it has this amount of inventory space left

// Starting corner of the crop field
startx = 145;
startz = 155;

// Opposite corner of the crop field
endx = 216;
endz = 226;

// Item config
seeditem = "minecraft:wheat_seeds";
deposititem = "minecraft:wheat";

// coordinates for the Player to walk to when depositing items
depositwheatx = startx;
depositwheatz = startz;

depositseedx = startx;
depositseedz = startz;

// yaw and pitch for the Player to look at when depositing items
// note that 0 yaw is south, 90 is west, 180 is north, and 270 is east
depositwheatyaw = 180;
depositwheatpitch = -14;

depositseedyaw = 150;
depositseedpitch = -40;

if (startz < endz) {
    hyaw = 0;
    pyaw = 180;
} else {
    hyaw = 180;
    pyaw = 0;
}

// Function to equip a given item on the hotbar if located in inventory
// name = "minecraft:itemname"
// hotbar = Preferred hotbar slot (may not be used)
// dmg = Minimum damage value, intended for use with tools to prevent breakages
function pick(name, hotbar = null, dmg = -1) {
    inv = Player.openInventory();
    slots = inv.getMap();

    if (hotbar == null) {
        hotbar = inv.getSelectedHotbarSlotIndex();
    }

    slot = slots["hotbar"][inv.getSelectedHotbarSlotIndex()];
    item = inv.getSlot(slot);
    dura = item.getMaxDamage() - item.getDamage();

    if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {
        inv.close();
        return true;
    }

    for (slot of Array.from(slots.get("main")).concat(slots.get("hotbar"))) {
        let item = inv.getSlot(slot);
        if (item.getItemId() === name && (dmg == -1 || dura > dmg)) {
            //Chat.log(`Found ${item.getItemId()} at slot ${slot}.`);
            inv.swap(slot, slots["hotbar"][hotbar]);
            Time.sleep(250);
            inv.setSelectedHotbarSlotIndex(parseInt(slot));
            inv.close();
            return true;
        }
    }
    inv.close();
    return false;
}

// Function that walks to the center of the given x, z coordinate; assumes flat y level
// If x, z is ommitted then centers the bot on the current block
// precise=true attempts to walk to the exact coordinate rather than the centre of the block
function walkTo(x = null, z = null, precise = false, timeout = null) {
    pos = Player.getPlayer().getPos();
    if (x == null) {
        x = pos.x;
    }
    if (z == null) {
        z = pos.z;
    }
    if (precise) {
        tx = x;
        tz = z;
    } else {
        if (x < 0) {
            tx = parseInt(x) - 0.5;
        } else {
            tx = parseInt(x) + 0.5;
        }
        if (z < 0) {
            tz = parseInt(z) - 0.5;
        } else {
            tz = parseInt(z) + 0.5;
        }
    }
    Chat.log("walking to x: " + tx + ", z: " + tz);
    KeyBind.keyBind('key.forward', true);
    timer = 0;
    while (true) {
        Player.getPlayer().lookAt(tx, pos.y, tz);
        pos = Player.getPlayer().getPos();
        if (Math.abs(pos.x - tx) < 0.5 && Math.abs(pos.z - tz) < 0.5) {
            KeyBind.keyBind('key.sneak', false);
        }
        if (Math.abs(pos.x - tx) < 0.075 && Math.abs(pos.z - tz) < 0.075) {
            break;
        }
        Client.waitTick();
        timer += 1;
        if (timeout && timer > timeout) {
            Chat.log("walkTo timed out");
            KeyBind.keyBind('key.forward', false);
            KeyBind.keyBind('key.sneak', false);
            return false;
        }
    }
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.sneak', false);
    Client.waitTick(5);
    pos = Player.getPlayer().getPos();
    Player.getPlayer().getRaw().method_5814(tx, pos.y, tz);
    return true;
}

// helper function which can be configured for (almost) any crop farm
// tx, tz: target coordinates, bot will exit cleanly when it arrives
// yaw, pitch: angle the bot will look at
// item: e.g. minecraft:diamond_axe for harvesting or minecraft:wheat_seeds etc. for replanting
// pause: tick delay between each mouse key press. may be useful to increase if the bot encounters anticheat issues
// error: whether or not the bot should abort if it is unable to pick the specified item

function farmLine(tx, tz, yaw, pitch = 90, item = null, pause = 1, dura = 15, error = false) {

    pos = Player.getPlayer().getPos();

    Player.getPlayer().lookAt(yaw, pitch);

    if (item != null) {
        pick(item);
    }

    Client.waitTick(pause);
    KeyBind.key('key.use', true);
    Client.waitTick(pause);
    KeyBind.key('key.use', false);
    Client.waitTick(pause);
    KeyBind.key('key.forward', true);
    while ((parseInt(pos.z) == tz || parseInt(pos.x) == tx) && !(parseInt(pos.z) == tz && parseInt(pos.x) == tx)) {
        Player.getPlayer().lookAt(yaw, pitch);
        if (item != null) {
            if (!pick(item, dmg = dura) && error) {
                Chat.log("ERROR: Failed to pick item, aborting");
                KeyBind.key('key.forward', false);
                throw 'Exception';
            }
        }
        Client.waitTick(pause);
        KeyBind.key('key.use', true);
        Client.waitTick(pause);
        KeyBind.key('key.use', false);
        Client.waitTick(pause);
        pos = Player.getPlayer().getPos();
    }
    KeyBind.key('key.forward', false);
    if ((parseInt(pos.z) == tz && parseInt(pos.x) == tx)) {
        rx += 1;            //testing
        walkTo(rx, tz);     //testing
        Player.getPlayer().lookAt(yaw, pitch);
        if (item != null) {
            if (!pick(item, dmg = dura) && error) {
                Chat.log("ERROR: Failed to pick item, aborting");
                KeyBind.key('key.forward', false);
                throw 'Exception';
            }
        }
        Client.waitTick(pause);
        KeyBind.key('key.use', true);
        Client.waitTick(pause);
        KeyBind.key('key.use', false);
        Client.waitTick(pause);
    } else {
        Chat.log("coordinate mismatch, aborting");
        throw 'Exception';
    }
}

pos = Player.getPlayer().getPos();
rx = startx;

for (let rx = parseInt(pos.x); rx + 1; rx++) {
    countInventorySpace();
    if (countInventorySpace() < threshold) {
        dropoff(rx, startz, deposititem);
        dropoff(rx, startz, seeditem);
    }

    walkTo(rx, startz);
    if (!!tool) {
        pick(tool);
    }
    Time.sleep(250);
    farmLine(rx, endz, hyaw, pitch = 90, item = tool, pause = 1, dura = 15, error = false);
    rx += 1;
    walkTo(rx, endz)
    Time.sleep(250);
    farmLine(rx, startz, pyaw, pitch = 90, item = tool, pause = 1, dura = 15, error = false);
    Time.sleep(250);
    if (GlobalVars.getBoolean("stopall") == true) {
        Chat.log("STOPALL");
        throw 'Exception';
    }
}