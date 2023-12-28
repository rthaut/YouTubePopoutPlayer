import React from "react";
import { Divider, Flex, Heading, Icon } from "@chakra-ui/react";
import PropTypes from "prop-types";

export default function TabPanelHeader({ title, icon = null }) {
  return (
    <>
      <Flex gap={2}>
        <Icon as={icon} boxSize={6} />
        <Heading size="md">{title}</Heading>
      </Flex>
      <Divider borderColor="gray.200" mt={2} mb={4} />
    </>
  );
}

TabPanelHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.func.isRequired,
};
