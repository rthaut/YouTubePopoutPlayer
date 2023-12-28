import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Center,
  Icon,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { MdOutlineHighlightOff as ResetIcon } from "react-icons/md";

import useOptionsStore from "../stores/optionsStore";

export default function ResetOptions() {
  const resetOptions = useOptionsStore((store) => store.reset);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cancelRef = React.useRef();

  const onConfirm = async () => {
    await resetOptions();
    onClose();

    toast({
      description: browser.i18n.getMessage("OptionsResetSuccessMessage"),
      status: "success",
      duration: 3_000,
      isClosable: true,
    });
  };

  return (
    <>
      <Center>
        <Button
          colorScheme="red"
          leftIcon={<Icon as={ResetIcon} boxSize={6} />}
          onClick={onOpen}
        >
          {browser.i18n.getMessage("ButtonResetLabel")}
        </Button>
      </Center>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              {browser.i18n.getMessage("ConfirmSettingsResetHeading")}
            </AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage("ConfirmSettingsResetText"),
              }}
            />
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {browser.i18n.getMessage("ButtonCancelResetLabel")}
              </Button>
              <Button onClick={onConfirm} colorScheme="red" ml={3}>
                {browser.i18n.getMessage("ButtonConfirmResetLabel")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
