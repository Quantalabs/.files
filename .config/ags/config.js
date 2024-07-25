const hyprland = await Service.import("hyprland");
const notifications = await Service.import("notifications");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");
const bluetooth = await Service.import("bluetooth");
const network = await Service.import("network");
import { NotificationPopups } from "./notifications.js";

const WifiIndicator = () =>
	Widget.Box({
		children: [
			Widget.Icon({
				icon: network.wifi.bind("icon_name"),
				tooltipText: network.wifi.bind("ssid").as((ssid) => ssid || "Unknown"),
			}),
		],
	});

const WiredIndicator = () =>
	Widget.Icon({
		icon: network.wired.bind("icon_name"),
	});

const NetworkIndicator = () =>
	Widget.Stack({
		children: {
			wifi: WifiIndicator(),
			wired: WiredIndicator(),
		},
		shown: network.bind("primary").as((p) => p || "wifi"),
		css: "margin-left: 4px;",
	});

const connectedList = Widget.Menu({
	children: [
		Widget.MenuItem({
			child: Widget.Box({
				setup: (self) =>
					self.hook(
						bluetooth,
						(self) => {
							self.children = bluetooth.connected_devices.map(
								({ icon_name, name }) =>
									Widget.Box([
										Widget.Icon(icon_name + "-symbolic"),
										Widget.Label(name),
									]),
							);

							self.visible = bluetooth.connected_devices.length > 0;
						},
						"notify::connected-devices",
					),
			}),
		}),
	],
});

const batteryProgress = Widget.Icon({
	icon: battery.bind("icon_name"),
	tooltipText: battery.bind("percent").as((p) => `${p}%`),
});

const indicatorBl = Widget.Button({
	child: Widget.Icon({
		icon: bluetooth
			.bind("enabled")
			.as((on) => `bluetooth-${on ? "active" : "disabled"}-symbolic`),
	}),
	on_primary_click: (_, event) => {
		connectedList.popup_at_pointer(event);
	},
	css: "padding: 0;",
});

/** @param {import('types/service/systemtray').TrayItem} item */
const SysTrayItem = (item) =>
	Widget.Button({
		child: Widget.Icon().bind("icon", item, "icon"),
		tooltipMarkup: item.bind("tooltip_markup"),
		onPrimaryClick: (_, event) => item.activate(event),
		onSecondaryClick: (_, event) => item.openMenu(event),
	});

const sysTray = Widget.Box({
	children: systemtray.bind("items").as((i) => i.map(SysTrayItem)),
});

const date = Variable("", {
	poll: [1000, 'date +"%a %b %-d %-I:%M %p"'],
});

const calendar = Widget.Calendar({
	showDayNames: true,
	showDetails: true,
	showHeading: true,
	showWeekNumbers: true,
	onDaySelected: ({ date: [y, m, d] }) => {
		print(`${y}. ${m}. ${d}.`);
	},
});

function Notification() {
	const popups = notifications.bind("popups");
	return Widget.Box({
		class_name: "notification",
		visible: popups.as((p) => p.length > 0),
		children: [
			Widget.Icon({
				icon: "preferences-system-notifications-symbolic",
			}),
			Widget.Label({
				label: "",
			}),
		],
	});
}

function Clock() {
	return Widget.Label({
		class_name: "clock",
		label: date.bind(),
	});
}

const Workspaces = (ws) =>
	Widget.Box({
		children: [...Array(ws || 10).keys()].map((i) =>
			Widget.Label({
				attribute: i + 1,
				vpack: "center",
				label: `${i + 1}`,
				setup: (self) =>
					self.hook(hyprland, () => {
						self.toggleClassName(
							"active",
							hyprland.active.workspace.id === i + 1,
						);
						self.toggleClassName(
							"occupied",
							(hyprland.getWorkspace(i + 1)?.windows || 0) > 0,
						);
					}),
			}),
		),
		className: "workspaces",
		setup: (box) => {
			if (ws === 1) {
				box.hook(hyprland.active.workspace, () =>
					box.children.map((btn) => {
						btn.visible = hyprland.workspaces.some(
							(ws) => ws.id === btn.attribute,
						);
					}),
				);
			}
		},
	});
function ClientTitle() {
	return Widget.Label({
		class_name: "client-title",
		label: hyprland.active.client.bind("class"),
		css: "font-weight: bold;",
	});
}

function Logo() {
	return Widget.Icon({
		icon: "/home/arvind/.config/ags/logo.svg",
		css: "margin-left: 8px;",
	});
}

function Left() {
	return Widget.Box({
		spacing: 8,
		children: [Logo(), ClientTitle(), Workspaces()],
	});
}

function Center() {
	return Widget.Box({
		spacing: 8,
		children: [],
	});
}

function Right() {
	return Widget.Box({
		hpack: "end",
		spacing: 8,
		children: [
			batteryProgress,
			NetworkIndicator(),
			indicatorBl,
			Clock(),
			sysTray,
		],
	});
}

const Bar = () =>
	Widget.Window({
		name: `bar`,
		anchor: ["top", "left", "right"],
		exclusivity: "exclusive",
		child: Widget.CenterBox({
			start_widget: Left(),
			center_widget: Center(),
			end_widget: Right(),
		}),
	});

App.config({
	windows: [Bar(), NotificationPopups()],
	style: "./style.css",
});
