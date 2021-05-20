/**
 * @name VPC
 * @author Venodez
 * @authorId 272391662205140993
 * @version 1.0
 * @description Permet de crée un tchat de proximité sur Minecraft à partir de Discord.
 * @website https://github.com/Venodez/VPC
 * @source https://github.com/Venodez/VPC/blob/main/better-discord/VPC.plugin.js
 * @updateUrl https://github.com/Venodez/VPC/blob/main/better-discord/VPC.plugin.js
 */



module.exports = (_ => {
	const config = {
		"info": {
			"name": "VPC",
			"author": "Venodez",
			"version": "1.0",
			"description": "Permet de crée un tchat de proximité sur Minecraft à partir de Discord."
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const messageDelay = 1000; //changing at own risk, might result in bans or mutes

		let settings = {};
	
		return class VPC extends Plugin {
			
            onLoad () {

                let guilds = BDFDB.LibraryModules.FolderStore.guildFolders.map(n => n.guildIds).flat(10).map(guildId => BDFDB.LibraryModules.GuildStore.getGuild(guildId)).filter(n => n);
                let mySettings = {}

                for (let guild of guilds) {

                    mySettings[guild.id] = {value: false, label: guild.name}

                }

				this.defaults = {

					settings: mySettings
				
                };
                


            }

			onStart () {


				this.forceUpdateAll();

			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel(collapseStates = {}) {
				let settingsPanel, settingsItems = [];

				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].label,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed (e) {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();