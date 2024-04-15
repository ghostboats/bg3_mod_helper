module.exports = {
//progressions main functions
    "AddSpells": {
        description: "Enables the addition of spells from a specified spell list entry in SpellLists.lsx.",
        parameters: ["guid (Required): SpellList Entry UUID", "SelectorId (Optional): SelectorId value of `DefaultValue/Spells.lsx`", "CastingAbility (Optional): Name of Attribute used for casting", "ActionResource (Optional): UUID of Action Resource for casting spells", "PrepareType (Optional, default=Default): AlwaysPrepared or Default", "CooldownType (Optional, default=Default): UntilRest or Default"]
    },
    "SelectAbilityBonus": {
        description: "Allows users to select ability bonuses from a specified list entry in AbilityList.lsx.",
        parameters: ["guid (Required): AbilityList Entry UUID", "Amount (default=0): Number of selections available", "BonusType (Required): AbilityBonus", "Amounts (Optional): Array of numbers indicating the bonus amounts for each selection, with defaults specified"]
    },
    "SelectPassives": {
        description: "Allows users to select passives from a specified list entry in PassivesList.lsx.",
        parameters: ["guid (Required): PassiveList Entry UUID", "Amount (Required): Number of selections available", "SelectorId (Optional): SelectorId value of DefaultValue/Passives.lsx"]
    },
    "SelectEquipment": {
        description: "Allows users to select equipment from a specified list entry in EquipmentList.lsx.",
        parameters: ["guid (Required): EquipmentList Entry UUID", "Amount (Required): Number of selections available", "SelectorId (Optional): SelectorId value of DefaultValue/Equipment.lsx"]
    },
    "SelectSkills": {
        description: "Enables users to select skills from a specified list entry in SkillList.lsx.",
        parameters: ["guid (Required): SkillList Entry UUID", "Amount (default=0): Number of selections available", "SelectorId (Optional): SelectorId value of DefaultValue/Skills.lsx"]
    },
    "SelectSkillsExpertise": {
        description: "Allows users to select skills expertise from a specified list entry in SkillList.lsx.",
        parameters: ["guid (Required): SkillList Entry UUID", "Amount (default=0): Number of selections available", "LimitToProficiency (Optional, default=true): Limits selections to skills with proficiency", "SelectorId (Optional): SelectorId value of DefaultValue/Skills.lsx"]
    },
    "SelectSpells": {
        description: "Allows users to select spells from a specified spell list entry in SpellLists.lsx.",
        parameters: ["guid (Required): SpellList Entry UUID", "Amount (default=1): Number of selections available", "SwapAmount (default=0): Number of spells that can be swapped", "SelectorId (Optional): SelectorId value of `DefaultValue/Spells.lsx`", "CastingAbility (Optional): Name of Attribute for casting", "ActionResource (Optional): UUID of Action Resource for casting spells", "PrepareType (Optional, default=Default): AlwaysPrepared or Default", "CooldownType (Optional, default=Default): UntilRest or Default"]
    },
//Add functors
    "ApplyEquipmentStatus": {
        description:'',
        parameters: ["ItemSlot: StatItemSlot", "StatusId: StatusId", "Chance: Int", "Duration: Lua", "StatusSpecificParam1: String", "StatusSpecificParam2: Int", "StatusSpecificParam3: Int", "StatsConditions: Conditions", "RequiresConcentration: Boolean"]
    },
    "ApplyStatus": {
        parameters: ["StatusId: StatusId", "Chance: Int", "Duration: Lua", "StatusSpecificParam1: String", "StatusSpecificParam2: Int", "StatusSpecificParam3: Int", "StatsConditions: Conditions", "RequiresConcentration: Boolean"]
    },
    "BreakConcentration": {
        parameters: []
    },
    "CreateConeSurface": {
        parameters: ["Radius: Float", "Duration: Float", "SurfaceType: Surface Type", "IsControlledByConcentration: Boolean", "Arg5: Float", "Arg6: Boolean"]
    },
    "CreateExplosion": {
        parameters: ["SpellId: SpellId"]
    },
    "CreateSurface": {
        parameters: ["Radius: Float", "Duration: Float", "SurfaceType: Surface Type", "IsControlledByConcentration: Boolean", "Arg5: Float", "Arg6: Boolean"]
    },
    "CreateWall": {
        parameters: []
    },
    "Counterspell": {
        parameters: []
    },
    "DealDamage": {
        parameters: ["Damage: Lua", "DamageType: DamageTypeOrDealDamageWeaponDamageType", "Magical: Magical", "Nonlethal: Nonlethal", "CoinMultiplier: Int", "Tooltip: Guid", "Arg7: Boolean", "Arg8: Boolean", "Arg9: Boolean", "Arg10: Boolean"]
    },
    "DisarmAndStealWeapon": {
        parameters: []
    },
    "DisarmWeapon": {
        parameters: []
    },
    "DoTeleport": {
        parameters: ["Arg1: Float"]
    },
    "Douse": {
        parameters: ["Arg1: Float", "Arg2: Float"]
    },
    "Drop": {
        parameters: ["Arg1: String"]
    },
    "ExecuteWeaponFunctors": {
        parameters: ["WeaponType: ExecuteWeaponFunctorsType"]
    },
    "FireProjectile": {
        parameters: ["Arg1: String"]
    },
    "Force": {
        parameters: ["Distance: Lua", "Origin: ForceFunctorOrigin", "Aggression: ForceFunctorAggression", "Arg4: Boolean", "Arg5: Boolean"]
    },
    "GainTemporaryHitPoints": {
        parameters: ["Amount: Lua"]
    },
    "Kill": {
        parameters: []
    },
    "MaximizeRoll": {
        parameters: ["DamageType: Damage Type"]
    },
    "Pickup": {
        parameters: ["Arg1: String"]
    },
    "RegainHitPoints": {
        parameters: ["HitPoints: Lua", "Type: ResurrectType"]
    },
    "RegainTemporaryHitPoints": {
        parameters: ["Amount: Lua"]
    },
    "RemoveAuraByChildStatus": {
        parameters: ["StatusId: StatusId"]
    },
    "RemoveStatus": {
        parameters: ["StatusId: StatusIdOrGroup"]
    },
    "RemoveStatusByLevel": {
        parameters: ["StatusId: StatusIdOrGroup", "Arg2: Int", "Arg3: Ability"]
    },
    "RemoveUniqueStatus": {
        parameters: ["StatusId: StatusId"]
    },
    "ResetCombatTurn": {
        parameters: []
    },
    "ResetCooldowns": {
        parameters: ["Type: SpellCooldownType"]
    },
    "Resurrect": {
        parameters: ["Chance: Float", "HealthPercentage: Float", "Type: ResurrectType"]
    },
    "RestoreResource": {
        parameters: ["ActionResource: String", "Amount: Lua", "Level: Int"]
    },
    "Sabotage": {
        parameters: ["Amount: Int"]
    },
    "SetAdvantage": {
        parameters: []
    },
    "SetDamageResistance": {
        parameters: ["DamageType: Damage Type"]
    },
    "SetDisadvantage": {
        parameters: []
    },
    "SetReroll": {
        parameters: ["Roll: Int", "Arg2: Boolean"]
    },
    "SetRoll": {
        parameters: ["Roll: Int", "DistributionOrDamageType: RollAdjustmentTypeOrDamageType"]
    },
    "SetStatusDuration": {
        parameters: ["StatusId: StatusId", "Duration: Float", "ChangeType: SetStatusDurationType"]
    },
    "ShortRest": {
        parameters: []
    },
    "Spawn": {
        parameters: ["TemplateId: Guid", "AiHelper: String", "StatusToApply1: StatusId", "StatusToApply2: StatusId", "StatusToApply3: StatusId", "StatusToApply4: StatusId", "Arg7: Boolean"]
    },
    "SpawnExtraProjectiles": {
        parameters: ["Arg1: String"]
    },
    "SpawnInInventory": {
        parameters: ["TemplateId: Guid", "Arg2: Int", "Arg3: Boolean", "Arg4: Boolean", "Arg5: Boolean", "Arg6: String", "Arg7: String", "Arg8: String"]
    },
    "Stabilize": {
        parameters: []
    },
    "Summon": {
        parameters: ["Template: Guid", "Duration: SummonDurationOrInt", "AIHelper: SpellId", "Arg4: Boolean", "StackId: String", "StatusToApply1: StatusId", "StatusToApply2: StatusId", "StatusToApply3: StatusId", "StatusToApply4: StatusId", "Arg10: Boolean"]
    },
    "SummonInInventory": {
        parameters: ["TemplateId: Guid", "Duration: SummonDurationOrInt", "Arg3: Int", "Arg4: Boolean", "Arg5: Boolean", "Arg6: Boolean", "Arg7: Boolean", "Arg8: String", "Arg9: String", "Arg10: String", "Arg11: String"]
    },
    "SurfaceChange": {
        parameters: ["SurfaceChange: Surface Change", "Chance: Float", "Arg3: Float", "Arg4: Float", "Arg5: Float"]
    },
    "SurfaceClearLayer": {
        parameters: ["Layer1: SurfaceLayer", "Layer2: SurfaceLayer"]
    },
    "SwapPlaces": {
        parameters: ["Animation: String", "Arg2: Boolean", "Arg3: Boolean"]
    },
    "SwitchDeathType": {
        parameters: ["DeathType: Death Type"]
    },
    "TeleportSource": {
        parameters: ["Arg1: Boolean", "Arg2: Boolean"]
    },
    "TriggerRandomCast": {
        parameters: ["Arg1: Int", "Arg2: Float", "Arg3: String", "Arg4: String", "Arg5: String", "Arg6: String"]
    },
    "TutorialEvent": {
        parameters: ["Event: Guid"]
    },
    "UseActionResource": {
        parameters: ["ActionResource: String", "Amount: String", "Level: Int", "Arg4: Boolean"]
    },
    "Unsummon": {
        parameters: []
    },
    "Unlock": {
        parameters: []
    },
    "UseAttack": {
        parameters: ["IgnoreChecks: Boolean"]
    },
    "UseSpell": {
        parameters: ["SpellId: SpellId", "IgnoreHasSpell: Boolean", "IgnoreChecks: Boolean", "Arg4: Boolean", "SpellCastGuid: Guid"]
    },
//AddDescriptionParams
    "Distance": {
        description: "Functionality related to distance with specified parameters.",
        parameters: ["Distance: Float"]
    },
    "LevelMapValue": {
        description: "Functionality related to level map value with specified parameters.",
        parameters: ["LevelMap: String"]
    },
//AddBoost
    "Ability": {
        description: "Boost to a specific ability.",
        parameters: ["Ability: Ability", "Amount: Int", "Arg3: Int"]
    },
    "AbilityOverrideMinimum": {
        description: "Boost that overrides the minimum value of an ability.",
        parameters: ["Ability: Ability", "Minimum: Int"]
    },
    "AC": {
        description: "Boost to AC.",
        parameters: ["AC: Int"]
    },
    "ACOverrideFormula": {
        description: "Boost that overrides the AC calculation formula.",
        parameters: ["AC: Int", "Arg2: Boolean", "Ability1: Ability", "Ability2: Ability", "Ability3: Ability"]
    },
    "ActionResource": {
        description: "Boost related to an action resource.",
        parameters: ["Resource: String", "Amount: Float", "Level: Int", "DieType: DieType"]
    },
    "ActionResourceConsumeMultiplier": {
        description: "Boost that multiplies the consumption of an action resource.",
        parameters: ["Resource: String", "Multiplier: Float", "Level: Int"]
    },
    "ActionResourceOverride": {
        description: "Boost that overrides an action resource.",
        parameters: ["Resource: String", "Amount: Float", "Level: Int", "DieType: DieType"]
    },
    "ActionResourcePreventReduction": {
        description: "Boost that prevents reduction of an action resource.",
        parameters: ["ActionResource: String", "Level: Int"]
    },
    "ActionResourceReplenishTypeOverride": {
        description: "Boost that overrides the replenish type of an action resource.",
        parameters: ["ActionResource: String", "ReplenishType: ResourceReplenishType"]
    },
    "ActiveCharacterLight": {
        description: "Boost related to the active character's light.",
        parameters: ["Light: String"]
    },
    "AddProficiencyToAC": {
        description: "Boost that adds proficiency to AC.",
        parameters: []
    },
    "AddProficiencyToDamage": {
        description: "Boost that adds proficiency to damage.",
        parameters: []
    },
    "AdvanceSpells": {
        description: "Boost that advances spells.",
        parameters: ["SpellId: SpellId", "Arg2: Int"]
    },
    "Advantage": {
        description: "Boost providing advantage under certain conditions.",
        parameters: ["Type: AdvantageType", "Arg2: String", "Tag1: String", "Tag2: String", "Tag3: String"]
    },
    "AiArchetypeOverride": {
        description: "Boost that overrides AI archetype.",
        parameters: ["Archetype: String", "Arg2: Int"]
    },
    "AreaDamageEvade": {
        description: "Boost that helps evade area damage.",
        parameters: []
    },
    "ArmorAbilityModifierCapOverride": {
        description: "Boost that overrides the cap of armor ability modifiers.",
        parameters: ["ArmorType: ArmorType", "Cap: Int"]
    },
    "AttackSpellOverride": {
        description: "Boost that overrides attack spells.",
        parameters: ["AttackSpell: SpellId", "OriginalSpell: SpellId"]
    },
    "Attribute": {
        description: "Boost related to specific attributes.",
        parameters: ["Flags: AttributeFlags"]
    },
    "BlockAbilityModifierDamageBonus": {
        description: "Boost that blocks ability modifier damage bonuses.",
        parameters: []
    },
    "BlockAbilityModifierFromAC": {
        description: "Boost that blocks ability modifiers from AC.",
        parameters: ["Ability: Ability"]
    },
    "BlockGatherAtCamp": {
        description: "Boost that blocks gathering at camp.",
        parameters: []
    },
    "BlockRegainHP": {
        description: "Boost that blocks regaining HP.",
        parameters: ["Type: ResurrectTypes"]
    },
    "BlockSomaticComponent": {
        description: "Boost that blocks somatic components in spellcasting.",
        parameters: []
    },
    "BlockTravel": {
        description: "Boost that blocks travel.",
        parameters: []
    },
    "BlockVerbalComponent": {
        description: "Boost that blocks verbal components in spellcasting.",
        parameters: []
    },
    "CannotBeDisarmed": {
        description: "Boost that prevents being disarmed.",
        parameters: []
    },
    "CanSeeThrough": {
        description: "Boost that allows seeing through obstacles.",
        parameters: ["CanSeeThrough: Boolean"]
    },
    "CanShootThrough": {
        description: "Boost that allows shooting through obstacles.",
        parameters: ["CanShootThrough: Boolean"]
    },
    "CanWalkThrough": {
        description: "Boost that allows walking through obstacles.",
        parameters: ["CanWalkThrough: Boolean"]
    },
    "CarryCapacityMultiplier": {
        description: "Boost that multiplies carry capacity.",
        parameters: ["Multiplier: Float"]
    },
    "CharacterUnarmedDamage": {
        description: "Boost to character's unarmed damage.",
        parameters: ["Damage: Lua", "DamageType: Damage Type"]
    },
    "CharacterWeaponDamage": {
        description: "Boost to character's weapon damage.",
        parameters: ["Amount: Lua", "DamageType: Damage Type"]
    },
    "ConcentrationIgnoreDamage": {
        description: "Boost that allows concentration to ignore damage.",
        parameters: ["SpellSchool: SpellSchool"]
    },
    "ConsumeItemBlock": {
        description: "Boost that blocks item consumption.",
        parameters: []
    },
    "CriticalDamageOnHit": {
        description: "Boost that adds critical damage on hit.",
        parameters: []
    },
    "CriticalHit": {
        description: "Boost related to critical hits.",
        parameters: ["Type: CriticalHitType", "Result: CriticalHitResult", "When: CriticalHitWhen", "Arg4: Float"]
    },
    "CriticalHitExtraDice": {
        description: "Boost that adds extra dice to critical hits.",
        parameters: ["ExtraDice: Int", "AttackType: AttackType"]
    },
    "DamageBonus": {
        description: "Boost that adds a bonus to damage.",
        parameters: ["Amount: Lua", "DamageType: Damage Type", "Arg3: Boolean"]
    },
    "DamageReduction": {
        description: "Boost that reduces damage.",
        parameters: ["DamageType: AllOrDamageType", "ReductionType: DamageReductionType", "Amount: Lua"]
    },
    "Detach": {
        description: "Boost that detaches entities.",
        parameters: []
    },
    "DetectDisturbancesBlock": {
        description: "Boost that blocks detection of disturbances.",
        parameters: ["Arg1: Boolean"]
    },
    "DialogueBlock": {
        description: "Boost that blocks dialogues.",
        parameters: []
    },
    "Disadvantage": {
        description: "Boost imposing disadvantage under certain conditions.",
        parameters: ["Type: AdvantageType", "Arg2: String", "Tag1: String", "Tag2: String", "Tag3: String"]
    },
    "DodgeAttackRoll": {
        description: "Boost that allows dodging attack rolls.",
        parameters: ["Arg1: Int", "Arg2: Int", "Status: StatusIdOrGroup"]
    },
    "DualWielding": {
        description: "Boost related to dual wielding.",
        parameters: ["DW: Boolean"]
    },
    "EnableBasicItemInteractions": {
        description: "Boost that enables basic item interactions.",
        parameters: []
    },
    "EntityThrowDamage": {
        description: "Boost that adds damage to thrown entities.",
        parameters: ["Die: String", "DamageType: Damage Type"]
    },
    "ExpertiseBonus": {
        description: "Boost that adds expertise bonus to a skill.",
        parameters: ["Skill: SkillType"]
    },
    "FallDamageMultiplier": {
        description: "Boost that multiplies fall damage.",
        parameters: ["Multiplier: Float"]
    },
    "GameplayLight": {
        description: "Boost related to gameplay lighting.",
        parameters: ["Arg1: Float", "Arg2: Boolean", "Arg3: Float", "Arg4: Boolean"]
    },
    "GameplayObscurity": {
        description: "Boost related to gameplay obscurity.",
        parameters: ["Obscurity: Float"]
    },
    "GuaranteedChanceRollOutcome": {
        description: "Boost that guarantees a specific outcome on a chance roll.",
        parameters: ["Arg1: Boolean"]
    },
    "HalveWeaponDamage": {
        description: "Boost that halves weapon damage.",
        parameters: ["Ability: Ability"]
    },
    "HiddenDuringCinematic": {
        description: "Boost that hides characters during cinematics.",
        parameters: []
    },
    "HorizontalFOVOverride": {
        description: "Boost that overrides horizontal field of view.",
        parameters: ["FOV: Float"]
    },
    "IgnoreEnterAttackRange": {
        description: "Boost that ignores enter attack range.",
        parameters: []
    },
    "IgnoreLeaveAttackRange": {
        description: "Boost that allows ignoring leave attack range.",
        parameters: []
    },
    "IgnoreLowGroundPenalty": {
        description: "Boost that ignores low ground penalty.",
        parameters: ["RollType: StatsRollType"]
    },
    "IgnorePointBlankDisadvantage": {
        description: "Boost that ignores point-blank disadvantage.",
        parameters: ["Flags: WeaponFlags"]
    },
    "IgnoreResistance": {
        description: "Boost that ignores resistance.",
        parameters: ["DamageType: Damage Type", "Flags: ResistanceBoostFlags"]
    },
    "IgnoreSurfaceCover": {
        description: "Boost that ignores surface cover.",
        parameters: ["SurfaceType: String"]
    },
    "IntrinsicSourceProficiency": {
        description: "Boost related to intrinsic source proficiency.",
        parameters: []
    },
    "IntrinsicSummonerProficiency": {
        description: "Boost related to intrinsic summoner proficiency.",
        parameters: []
    },
    "Invisibility": {
        description: "Boost granting invisibility.",
        parameters: []
    },
    "ItemReturnToOwner": {
        description: "Boost that returns items to their owner.",
        parameters: []
    },
    "JumpMaxDistanceBonus": {
        description: "Boost that adds a bonus to maximum jump distance.",
        parameters: ["Bonus: Float"]
    },
    "JumpMaxDistanceMultiplier": {
        description: "Boost that multiplies the maximum jump distance.",
        parameters: ["Multiplier: Float"]
    },
    "LeaveTriggers": {
        description: "Boost related to leave triggers.",
        parameters: []
    },
    "Lock": {
        description: "Boost related to locks.",
        parameters: ["DC: Guid"]
    },
    "Lootable": {
        description: "Boost related to lootability.",
        parameters: []
    },
    "MaximizeHealing": {
        description: "Boost that maximizes healing.",
        parameters: ["Direction: HealingDirection", "Type: ResurrectType"]
    },
    "MaximumRollResult": {
        description: "Boost setting a maximum roll result.",
        parameters: ["RollType: StatsRollType", "MinResult: Int"]
    },
    "MinimumRollResult": {
        description: "Boost setting a minimum roll result.",
        parameters: ["RollType: StatsRollType", "MinResult: Int"]
    },
    "MonkWeaponAttackOverride": {
        description: "Boost that overrides monk weapon attacks.",
        parameters: []
    },
    "MonkWeaponDamageDiceOverride": {
        description: "Boost that overrides monk weapon damage dice.",
        parameters: ["Arg1: Lua"]
    },
    "MovementSpeedLimit": {
        description: "Boost that sets a limit on movement speed.",
        parameters: ["Type: MovementSpeedType"]
    },
    "NoAOEDamageOnLand": {
        description: "Boost that prevents AOE damage on land.",
        parameters: []
    },
    "NonLethal": {
        description: "Boost that makes attacks non-lethal.",
        parameters: []
    },
    "ObjectSize": {
        description: "Boost that affects object size.",
        parameters: ["Size: Int"]
    },
    "ObjectSizeOverride": {
        description: "Boost that overrides object size.",
        parameters: ["Size: String"]
    },
    "ProficiencyBonus": {
        description: "Boost related to proficiency bonus.",
        parameters: ["Type: ProficiencyBonusBoostType", "Arg2: String"]
    },
    "PhysicalForceRangeBonus": {
        description: "Boost that adds a bonus to physical force range.",
        parameters: ["Arg1: String"]
    },
    "ProficiencyBonusOverride": {
        description: "Boost that overrides the proficiency bonus.",
        parameters: ["Bonus: Lua"]
    },
    "ProjectileDeflect": {
        description: "Boost related to projectile deflection.",
        parameters: ["Type1: String", "Type2: String"]
    },
    "RedirectDamage": {
        description: "Boost that redirects damage.",
        parameters: ["Arg1: Float", "DamageType: Damage Type", "DamageType2: Damage Type", "Arg4: Boolean"]
    },
    "ReduceCriticalAttackThreshold": {
        description: "Boost that reduces the threshold for critical attacks.",
        parameters: ["Threshold: Int", "StatusId: StatusIdOrGroup"]
    },
    "Resistance": {
        description: "Boost providing resistance to damage.",
        parameters: ["DamageType: AllOrDamageType", "ResistanceBoostFlags: ResistanceBoostFlags"]
    },
    "RollBonus": {
        description: "Boost providing a bonus to rolls.",
        parameters: ["RollType: StatsRollType", "Bonus: Lua", "Arg3: String"]
    },
    "Savant": {
        description: "Boost related to specific spell schools.",
        parameters: ["SpellSchool: SpellSchool"]
    },
    "ScaleMultiplier": {
        description: "Boost that multiplies scale.",
        parameters: ["Multiplier: Float"]
    },
    "SightRangeAdditive": {
        description: "Boost that adds to sight range.",
        parameters: ["Range: Float"]
    },
    "SightRangeMaximum": {
        description: "Boost that sets a maximum sight range.",
        parameters: ["Range: Float"]
    },
    "SightRangeMinimum": {
        description: "Boost that sets a minimum sight range.",
        parameters: ["Range: Float"]
    },
    "SightRangeOverride": {
        description: "Boost that overrides sight range.",
        parameters: ["Range: Float"]
    },
    "Skill": {
        description: "Boost related to skills.",
        parameters: ["Skill: SkillType", "Amount: Int"]
    },
    "SoundsBlocked": {
        description: "Boost that blocks sounds.",
        parameters: []
    },
    "SpellResistance": {
        description: "Boost that adds spell resistance.",
        parameters: ["Resistance: ResistanceBoostFlags"]
    },
    "SpellSaveDC": {
        description: "Boost that affects spell save DC.",
        parameters: ["DC: Int"]
    },
    "TwoWeaponFighting": {
        description: "Boost related to two-weapon fighting.",
        parameters: []
    },
    "UnarmedMagicalProperty": {
        description: "Boost that adds magical properties to unarmed attacks.",
        parameters: [] 
    },
    "UnlockInterrupt": {
        description: "Boost that unlocks interrupt actions.",
        parameters: ["Interrupt: Interrupt"]
    },
    "UnlockSpell": {
        description: "Boost that unlocks a spell.",
        parameters: ["SpellId: SpellId", "Type: UnlockSpellType", "SpellGuid: String", "Cooldown: SpellCooldownType", "Ability: Ability"]
    },
    "UnlockSpellVariant": {
        description: "Boost that unlocks spell variants.",
        parameters: ["15 params: all intss todo"]
    },
    "VoicebarkBlock": {
        description: "Boost that blocks voice barks.",
        parameters: []
    },
    "WeaponAttackRollAbilityOverride": {
        description: "Boost that overrides the ability used for weapon attack rolls.",
        parameters: ["Ability: AbilityOrAttackRollAbility"]
    },
    "WeaponAttackRollBonus": {
        description: "Boost that adds a bonus to weapon attack rolls.",
        parameters: ["Amount: Lua"]
    },
    "WeaponAttackTypeOverride": {
        description: "Boost that overrides weapon attack type.",
        parameters: ["Type: AttackType"]
    },
    "WeaponDamage": {
        description: "Boost to weapon damage.",
        parameters: ["Amount: Lua", "DamageType: Damage Type", "Arg3: Boolean"]
    },
    "WeaponDamageResistance": {
        description: "Boost providing resistance to specific weapon damage types.",
        parameters: ["DamageType1: Damage Type", "DamageType2: Damage Type", "DamageType3: Damage Type"]
    },
    "WeaponDamageDieOverride": {
        description: "Boost that overrides weapon damage die.",
        parameters: ["DamageDie: String"]
    },
    "WeaponDamageTypeOverride": {
        description: "Boost that overrides weapon damage type.",
        parameters: ["DamageType: Damage Type"]
    },
    "WeaponEnchantment": {
        description: "Boost related to weapon enchantment.",
        parameters: ["Enchantment: Int"]
    },
    "WeaponProperty": {
        description: "Boost related to weapon properties.",
        parameters: ["Flags1: WeaponFlags"]
    }
};