import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Box, Button, IconButton, InputRightElement } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import InputField from "src/components/InputField";
import Wrapper from "src/components/Wrapper";
import { useRegisterMutation } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import { toErrorMap } from "src/utils/toErrorMap";

export interface RegisterProps {}

export const Register: FC<RegisterProps> = ({}: RegisterProps) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();
  const [passwordShown, setPasswordShown] = useState<boolean>(false);

  // TODO: Show "Register" heading here and add a link to login
  return (
    <Wrapper small={true}>
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          console.log(values);
          const response = await register({ options: values });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          } else {
            setErrors({ username: "Unexpected response from server" });
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              type="email"
              name="email"
              placeholder="email"
              label="Email"
            />
            <Box mt="4">
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
            </Box>
            <Box mt="4">
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type={passwordShown ? "text" : "password"}
                chakraProps={{ pr: "1.5rem" }}
              >
                <InputRightElement width="1.5rem">
                  <IconButton
                    aria-label={
                      passwordShown ? "Hide password" : "Show password"
                    }
                    icon={passwordShown ? <ViewOffIcon /> : <ViewIcon />}
                    h="1.75rem"
                    size="xs"
                    onClick={() => setPasswordShown((v) => !v)}
                  />
                </InputRightElement>
              </InputField>
            </Box>
            <Button
              colorScheme="blue"
              isLoading={isSubmitting}
              mt="4"
              width="100%"
              type="submit"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
