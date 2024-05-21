// skeleton_files.js
const templates = {
    'Localization loca.xml': `<?xml version="1.0" encoding="utf-8"?>\n<contentList>\n</contentList>`,
    'Progressions.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="10" build="100"/>
    <region id="Progressions">
        <node id="root">
            <children>
                <node id="Progression">
                    <attribute id="Boosts" type="LSString" value=""/>
                    <attribute id="Level" type="uint8" value=""/>
                    <attribute id="Name" type="LSString" value=""/> <!--Enter your mod name Ex. "Barbarian"-->
                    <attribute id="ProgressionType" type="uint8" value="0"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <children>
                        <node id="SubClasses">
                            <children>
                                <node id="SubClass">
                                    <attribute id="Object" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                                </node>
                                <node id="SubClass">
                                    <attribute id="Object" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                                </node>
                            </children>
                        </node>
                    </children>
                </node>
            </children>
        </node>
    </region>
</save>
<!--press control shift a to quick spawn a line below
<attribute id="Boosts" type="LSString" value=""/>
<attribute id="Level" type="uint8" value=""/>
<attribute id="Name" type="LSString" value=""/>
<attribute id="ProgressionType" type="uint8" value="0"/>
<attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
<attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
end custom attribute lines-->
<!--press control shift 2 to quick spawn a line below
example
end ctrl shift 2 clipboard-->
`,
    'ClassDescriptions.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="314"/>
    <region id="ClassDescriptions">
        <node id="root">
            <children>
                <node id="ClassDescription">
                    <attribute id="BaseHp" type="int32" value="12"/>
                    <attribute id="CharacterCreationPose" type="guid" value="0f07ec6e-4ef0-434e-9a51-1353260ccff8"/>
                    <attribute id="ClassEquipment" type="FixedString" value="EQP_CC_Barbarian"/>
                    <attribute id="ClassHotbarColumns" type="int32" value="5"/>
                    <attribute id="CommonHotbarColumns" type="int32" value="9"/>
                    <attribute id="Description" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="HpPerLevel" type="int32" value=""/>
                    <attribute id="ItemsHotbarColumns" type="int32" value="2"/>
                    <attribute id="LearningStrategy" type="uint8" value="1"/>
                    <attribute id="Name" type="FixedString" value=""/> <!--Enter your mod name Ex. "Barbarian"-->
                    <attribute id="PrimaryAbility" type="uint8" value=""/> <!--1 to 6-->
                    <attribute id="ProgressionTableUUID" type="guid" value=""/>
                    <attribute id="SoundClassType" type="FixedString" value="Barbarian"/>
                    <attribute id="SpellCastingAbility" type="uint8" value=""/> <!--1 to 6-->
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <children>
                        <node id="Tags">
                            <attribute id="Object" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                        </node>
                    </children>
                </node>
            </children>
        </node>
    </region>
</save>
<!--press control shift a to quick spawn a line below
<attribute id="BaseHp" type="int32" value="12"/>
<attribute id="ClassEquipment" type="FixedString" value="EQP_CC_Barbarian"/>
<attribute id="ClassHotbarColumns" type="int32" value="5"/>
<attribute id="CommonHotbarColumns" type="int32" value="9"/>
<attribute id="Description" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
<attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
<attribute id="HpPerLevel" type="int32" value=""/>
<attribute id="ItemsHotbarColumns" type="int32" value="2"/>
<attribute id="LearningStrategy" type="uint8" value="1"/>
<attribute id="Name" type="FixedString" value=""/>
<attribute id="PrimaryAbility" type="uint8" value=""/>
<attribute id="ProgressionTableUUID" type="guid" value=""/>
<attribute id="SoundClassType" type="FixedString" value="Barbarian"/>
<attribute id="SpellCastingAbility" type="uint8" value=""/>
<attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
end custom attribute lines-->
<!--press control shift 2 to quick spawn a line below
example
end ctrl shift 2 clipboard-->
`,
    'ActionResourceDefinitions.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="3" revision="0" build="302"/>
    <region id="ActionResourceDefinitions">
        <node id="root">
            <children>
                <node id="ActionResourceDefinition">
                    <attribute id="Description" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="Error" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="MaxLevel" type="uint32" value="0"/>
                    <attribute id="Name" type="FixedString" value="ActionPoint"/>
                    <attribute id="ReplenishType" type="FixedString" value="Turn"/>
                    <attribute id="ShowOnActionResourcePanel" type="bool" value="true"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="ActionResourceDefinition">
                    <attribute id="Description" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="IsSpellResource" type="bool" value="false"/>
                    <attribute id="MaxLevel" type="uint32" value="0"/>
                    <attribute id="Name" type="FixedString" value="ExtraActionPoint"/>
                    <attribute id="PartyActionResource" type="bool" value="false"/>
                    <attribute id="ReplenishType" type="FixedString" value="Never"/>
                    <attribute id="ShowOnActionResourcePanel" type="bool" value="true"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UpdatesSpellPowerLevel" type="bool" value="false"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'ProgressionDescriptions.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="322"/>
    <region id="ProgressionDescriptions">
        <node id="root">
            <children>
                <node id="ProgressionDescription">
                    <attribute id="ExactMatch" type="FixedString" value="GENERIC_BOOSTS"/>
                    <attribute id="Hidden" type="bool" value="true"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="ProgressionDescription">
                    <attribute id="Hidden" type="bool" value="true"/>
                    <attribute id="PassivePrototype" type="FixedString" value="DeathSavingThrows"/>
                    <attribute id="Type" type="FixedString" value="DownedStatus"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                </children>
            </node>
        </region>
    </save>`,
    'CharacterCreationAppearanceVisuals.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="328"/>
    <region id="CharacterCreationAppearanceVisuals">
        <node id="root">
            <children> <!--Template for custom head on default fem body tiefling. Some values will need adjusting for other types of entries. Remove notes before paking.-->
                <node id="CharacterCreationAppearanceVisual">
                    <attribute id="BodyShape" type="uint8" value="0"/>
                    <attribute id="BodyType" type="uint8" value="1"/>
                    <attribute id="DefaultSkinColor" type="guid" value="39949ade-52c7-d562-df3f-52da62275e26"/>
                    <attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/><!--Handle to match loca entry-->
                    <attribute id="IconIdOverride" type="FixedString" value="0_Head_00000000-0000-0000-0000-000000000000"/><!--UUID to match Mod_Icons.lsx entry for CC Icon.-->
                    <attribute id="RaceUUID" type="guid" value="b6dccbed-30f3-424b-a181-c4540cf38197"/><!--Vanilla Race UUIDs Listed Below-->
                    <attribute id="SlotName" type="FixedString" value="Head"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/><!--Unique UUID-->
                    <attribute id="VisualResource" type="guid" value="00000000-0000-0000-0000-000000000000"/><!--Visual Resource ID to match _merged.lsf.lsx entry-->
                </node>
                <node id="CharacterCreationAppearanceVisual">
                    <attribute id="BodyShape" type="uint8" value="0"/>
                    <attribute id="BodyType" type="uint8" value="1"/>
                    <attribute id="DefaultSkinColor" type="guid" value="39949ade-52c7-d562-df3f-52da62275e26"/>
                    <attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
                    <attribute id="IconIdOverride" type="FixedString" value="0_Head_00000000-0000-0000-0000-000000000000"/>
                    <attribute id="RaceUUID" type="guid" value="b6dccbed-30f3-424b-a181-c4540cf38197"/>
                    <attribute id="SlotName" type="FixedString" value="Head"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="VisualResource" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                    <!-- RaceUUIDs
                    Deep Gnome: 3560f4a2-c0b8-4f8b-baf8-6b6eaef0c160
                    Dragonborn: 9c61a74a-20df-4119-89c5-d996956b6c66
                    Drow: 4f5d1434-5175-4fa9-b7dc-ab24fba37929
                    Dwarf: 0ab2874d-cfdc-405e-8a97-d37bfbb23c52
                    Elf: 6c038dcb-7eb5-431d-84f8-cecfaf1c0c5a
                    Githyanki: bdf9b779-002c-4077-b377-8ea7c1faa795
                    Gnome: f1b3f884-4029-4f0f-b158-1f9fe0ae5a0d
                    HalfElf/Drow: 45f4ac10-3c89-4fb2-b37d-f973bb9110c0
                    Halfling: 78cd3bcc-1c43-4a2a-aa80-c34322c16a04
                    Half-Orc: 5c39a726-71c8-4748-ba8d-f768b3c11a91
                    Human: 0eb594cb-8820-4be6-a58d-8be7a1a98fba
                    Tiefling: b6dccbed-30f3-424b-a181-c4540cf38197-->
            </children>
        </node>
    </region>
</save>
<!--press control shift a to quick spawn a line below
<attribute id="BodyShape" type="uint8" value="0"/>
<attribute id="BodyType" type="uint8" value="1"/>
<attribute id="DefaultSkinColor" type="guid" value="39949ade-52c7-d562-df3f-52da62275e26"/>
<attribute id="DisplayName" type="TranslatedString" handle="h000000000000000000000000000000000000" version="1"/>
<attribute id="IconIdOverride" type="FixedString" value="0_Head_00000000-0000-0000-0000-000000000000"/>
<attribute id="RaceUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
<attribute id="SlotName" type="FixedString" value="Head"/>
<attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
<attribute id="VisualResource" type="guid" value="00000000-0000-0000-0000-000000000000"/>
end custom attribute lines-->
<!--press control shift 2 to quick spawn a line below
example
end ctrl shift 2 clipboard-->
`,
    'AbilityDistributionPresets.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="307"/>
    <region id="AbilityDistributionPresets">
        <node id="root">
            <children>
                <node id="AbilityDistributionPreset">
                    <attribute id="Charisma" type="int32" value="10"/>
                    <attribute id="ClassUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="Constitution" type="int32" value="14"/>
                    <attribute id="Dexterity" type="int32" value="13"/>
                    <attribute id="Intelligence" type="int32" value="8"/>
                    <attribute id="Strength" type="int32" value="15"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="Wisdom" type="int32" value="12"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'Abilities.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="319"/>
    <region id="DefaultValues">
        <node id="root">
            <children>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="Dexterity;Wisdom"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'Equipments.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="307"/>
    <region id="DefaultValues">
        <node id="root">
            <children>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="ARM_Instrument_Violin"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="SelectorId" type="LSString" value="BardInstrument"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'Feats.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="319"/>
    <region id="DefaultValues">
        <node id="root"/>
    </region>
</save>`,
    'Passives.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="319"/>
    <region id="DefaultValues">
        <node id="root">
            <children>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="FightingStyle_Defense"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="FightingStyle_GreatWeaponFighting"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="OriginUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="FavoredEnemy_MageBreaker"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="SelectorId" type="LSString" value="FavoredEnemy"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'PreparedSpells.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="325"/>
    <region id="DefaultValues">
        <node id="root">
            <children>
                <node id="DefaultValue">
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="Prepare" type="LSString" value="Target_CureWounds;Target_Entangle;Target_Goodberry;Zone_Thunderwave;Target_HealingWord"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="DefaultValue">
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="OriginUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="Prepare" type="LSString" value="Target_InflictWounds;Projectile_GuidingBolt;Target_HealingWord;Target_ShieldOfFaith"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'Skills.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="329"/>
    <region id="DefaultValues">
        <node id="root">
            <children>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="Perception;Stealth;Survival;Nature;AnimalHandling;Investigation;Insight;Athletics"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="Perception;Stealth;Survival;Nature;AnimalHandling;Investigation;Insight;Athletics"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="RaceUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'Spells.lsx': `<?xml version="1.0" encoding="UTF-8"?>
<save>
    <version major="4" minor="0" revision="9" build="320"/>
    <region id="DefaultValues">
        <node id="root">
            <children>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="Target_Resistance;Target_Guidance;Target_SacredFlame;Shout_Thaumaturgy"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
                <node id="DefaultValue">
                    <attribute id="Add" type="LSString" value="Target_ChillTouch;Projectile_AcidSplash;Target_TrueStrike;Target_Light;Target_MageHand;Projectile_RayOfFrost;Projectile_FireBolt;Shout_BladeWard;Target_DancingLights;Projectile_PoisonSpray;Target_ShockingGrasp;Target_MinorIllusion;Target_Friends"/>
                    <attribute id="Level" type="int32" value="1"/>
                    <attribute id="SelectorId" type="LSString" value="SorcererCantrip"/>
                    <attribute id="TableUUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                    <attribute id="UUID" type="guid" value="00000000-0000-0000-0000-000000000000"/>
                </node>
            </children>
        </node>
    </region>
</save>`,
    'merged.lsx': '../support_files/templates/long_skeleton_files/merged.lsx',
    'meta.lsx': '../support_files/templates/long_skeleton_files/meta.lsx',
    'Icons_ModName.lsx': '../support_files/templates/long_skeleton_files/Icons_ModName.lsx',
    'merged_atlas.lsx': '../support_files/templates/long_skeleton_files/merged_atlas.lsx',
    'BootstrapServer.lua': 'PersistentVars = {}',
    'Config.json': '../support_files/templates/long_skeleton_files/Config.json'
};

module.exports = templates;
