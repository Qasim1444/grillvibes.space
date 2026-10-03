<template>
  <div class="ui-field" :class="{ 'ui-field--error': error }">
    <label v-if="label" class="ui-label" :for="fieldId">{{ label }}</label>

    <!-- Select -->
    <select
      v-if="type === 'select'"
      :id="fieldId"
      class="ui-select"
      :multiple="multiple"
      :value="modelValue"
      @change="$emit('update:modelValue', castOption($event.target))"
    >
      <slot />
    </select>

    <!-- Textarea -->
    <textarea
      v-else-if="type === 'textarea'"
      :id="fieldId"
      class="ui-textarea"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>

    <!-- Default input -->
    <input
      v-else
      :id="fieldId"
      class="ui-input"
      :type="type"
      :placeholder="placeholder"
      :step="step"
      :readonly="readonly"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <p v-if="error" class="ui-field__error">{{ error }}</p>
    <slot name="hint" />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, null], default: "" },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  step: { type: String, default: null },
  readonly: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

defineEmits(["update:modelValue"]);

// Stable-ish id for label association.
const fieldId = computed(
  () => `f-${(props.label || props.placeholder || "field").toLowerCase().replace(/\s+/g, "-")}`
);

// Preserve boolean option values coming from <option :value="true">.
function castOption(el) {
  if (props.multiple) {
    return Array.from(el.selectedOptions).map((option) => option.value);
  }

  const opt = el.options[el.selectedIndex];
  const raw = opt?.getAttribute("value") ?? el.value;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return el.value;
}
</script>
