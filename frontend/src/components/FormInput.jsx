function FormInput({
  label,
  error,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-900">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}
      <input
        {...props}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
          error
            ? 'border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        } ${inputClassName}`}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export default FormInput;
