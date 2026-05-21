export const reasoner = async ({
  message,
  toolResult
}) => {

  try {

    const result =
      await geminiModel.generateContent(`
User: ${message}

Data:
${JSON.stringify(toolResult)}

Trả lời tự nhiên.
`);

    return result.response.text();

  } catch (err) {

    console.log(err.message);

    // fallback local
    if (Array.isArray(toolResult)) {

      return toolResult
        .map(v =>
          `${v.name} - ${v.price?.toLocaleString()} VNĐ`
        )
        .join("\n");
    }

    return "Hiện AI đang bận.";
  }
};