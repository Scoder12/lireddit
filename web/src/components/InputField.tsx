import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputProps,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { FC, PropsWithChildren } from "react";

export type InputFieldProps = InputProps & {
  name: string;
  label: string;
};

export const InputField: FC<InputFieldProps> = ({
  label,
  children,
  ...props
}: PropsWithChildren<InputFieldProps>) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputGroup size="md">
        <Input {...field} {...props} id={field.name} />
        {children}
      </InputGroup>
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
